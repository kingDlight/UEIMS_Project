package com.ueims.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.request.EligibleStudentUpdateRequest;
import com.ueims.dto.response.EligibleStudentResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.Semester;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.EligibleStudentService;
import com.ueims.util.ExcelImportUtil;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EligibleStudentServiceImpl implements EligibleStudentService {
    EligibleStudentRepository repository;
    SemesterRepository semesterRepository;
    UserRepository userRepository;

    @Override
    public List<EligibleStudent> findAll() {
        return repository.findAll();
    }

    @Override
    public EligibleStudent findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public EligibleStudent save(EligibleStudent entity) {
        if (entity.getEligibleId() != null) {
            EligibleStudent existing =
                    repository.findById(entity.getEligibleId()).orElse(null);
            if (existing != null && "OJT".equals(existing.getStatus()) && !("OJT".equals(entity.getStatus()))) {
                var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                        .getAuthentication();
                boolean isAdmin = authentication != null
                        && authentication.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                if (!isAdmin) {
                    throw new AppException(ErrorCode.ADMIN_INTERVENTION_REQUIRED);
                }
            }
        }
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public EligibleStudent update(UUID id, EligibleStudentUpdateRequest request) {
        EligibleStudent existing =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ELIGIBLE_STUDENT_NOT_FOUND));

        // BR-14: cannot modify records under a LOCKED semester (DB trigger will
        // also enforce, but checking here gives a clean 4xx with a clear message
        // instead of a 500 from the trigger exception).
        Semester semester = existing.getSemester();
        if (semester != null && "LOCKED".equals(semester.getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_INVALID_TRANSITION);
        }

        // BR-21: locked (OJT-approved) students can only update profile fields (gpa, name, email, major) and status.
        // studentCode and currentSemester cannot be modified.
        String newStatus = request.getStatus() != null ? request.getStatus() : existing.getStatus();
        if (Boolean.TRUE.equals(existing.getIsLocked())) {
            boolean validLockedUpdate = request.getStudentCode().equals(existing.getStudentCode())
                    && java.util.Objects.equals(request.getCurrentSemester(), existing.getCurrentSemester());
            if (!validLockedUpdate) {
                throw new AppException(ErrorCode.SEMESTER_INVALID_TRANSITION);
            }
        }

        // Guard: OJT → non-OJT admin-only rule
        if ("OJT".equals(existing.getStatus()) && !"OJT".equals(newStatus)) {
            var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication();
            boolean isAdmin = authentication != null
                    && authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                throw new AppException(ErrorCode.ADMIN_INTERVENTION_REQUIRED);
            }
        }

        // Guard: BR-22 / validate_ojt_approval trigger — entering OJT requires ACCEPTED or MATCHED.
        // Mirrored here so the API returns a clean 400 instead of leaking the raw DB trigger message.
        if ("OJT".equals(newStatus)
                && !"OJT".equals(existing.getStatus())
                && !"ACCEPTED".equals(existing.getStatus())
                && !"MATCHED".equals(existing.getStatus())) {
            throw new AppException(ErrorCode.INVALID_STATUS_FOR_OJT);
        }

        // Uniqueness: studentCode must not collide with another row in the same semester
        if (request.getStudentCode() != null && !request.getStudentCode().equals(existing.getStudentCode())) {
            UUID semesterId =
                    existing.getSemester() != null ? existing.getSemester().getSemesterId() : null;
            if (semesterId != null
                    && repository.existsByStudentCodeAndSemester_SemesterId(request.getStudentCode(), semesterId)) {
                throw new AppException(ErrorCode.ELIGIBLE_STUDENT_DUPLICATE);
            }
        }

        existing.setStudentCode(request.getStudentCode());
        existing.setFullName(request.getFullName());
        existing.setEmail(request.getEmail());
        existing.setMajor(request.getMajor());
        existing.setGpa(request.getGpa());
        existing.setCurrentSemester(request.getCurrentSemester());

        // BR-23 / chk_cancel_audit: when status flips to CANCELLED we MUST
        // populate cancelled_reason and cancelled_by together, otherwise the
        // DB CHECK constraint throws and the request returns 500.
        if ("CANCELLED".equals(newStatus) && !"CANCELLED".equals(existing.getStatus())) {
            String reason = request.getCancelledReason();
            if (reason == null || reason.isBlank()) {
                throw new AppException(ErrorCode.CANCEL_REASON_REQUIRED);
            }
            org.springframework.security.core.Authentication authentication =
                    org.springframework.security.core.context.SecurityContextHolder.getContext()
                            .getAuthentication();
            if (authentication == null
                    || authentication.getName() == null
                    || "anonymousUser".equals(authentication.getName())) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            com.ueims.model.entity.User actor = userRepository
                    .findByEmail(authentication.getName())
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
            existing.setCancelledReason(reason);
            existing.setCancelledBy(actor);
        }

        existing.setStatus(newStatus);

        return repository.save(existing);
    }

    @Override
    public List<EligibleStudentResponse> importFromExcel(MultipartFile file, UUID semesterId) {
        Semester semester = semesterRepository
                .findById(semesterId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        List<EligibleStudent> parsed;
        try {
            parsed = ExcelImportUtil.parseEligibleStudents(file.getInputStream());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }

        List<EligibleStudent> toInsert = new ArrayList<>();
        int skipped = 0;

        for (EligibleStudent student : parsed) {
            if (repository.existsByStudentCodeAndSemester_SemesterId(student.getStudentCode(), semesterId)) {
                skipped++;
            } else {
                student.setSemester(semester);
                toInsert.add(student);
            }
        }

        if (skipped > 0) {
            log.warn("Skipped {} duplicate student(s) already in semester {}", skipped, semesterId);
        }

        List<EligibleStudent> savedStudents = repository.saveAll(toInsert);

        return savedStudents.stream()
                .map(s -> EligibleStudentResponse.builder()
                        .studentCode(s.getStudentCode())
                        .fullName(s.getFullName())
                        .email(s.getEmail())
                        .major(s.getMajor())
                        .gpa(s.getGpa())
                        .currentSemester(s.getCurrentSemester())
                        .build())
                .toList();
    }

    @Override
    public int finalizeOjtList(List<UUID> studentIds) {
        if (studentIds == null || studentIds.isEmpty()) {
            return 0;
        }

        List<EligibleStudent> students = repository.findAllById(studentIds);
        if (students.isEmpty()) {
            return 0;
        }

        LocalDateTime now = LocalDateTime.now();
        for (EligibleStudent student : students) {
            if (!"ACCEPTED".equals(student.getStatus())
                    && !"MATCHED".equals(student.getStatus())
                    && !"OJT".equals(student.getStatus())) {
                throw new AppException(ErrorCode.INVALID_STATUS_FOR_OJT);
            }
            student.setStatus("OJT");
            student.setApprovedAt(now);
        }

        repository.saveAll(students);
        log.info("Finalized OJT list for {} students moved to OJT status.", students.size());
        return students.size();
    }

    @Override
    public byte[] exportOjtStudentsToExcel(UUID semesterId) {
        List<EligibleStudent> students = repository.findBySemester_SemesterId(semesterId);

        if (students.size() > 10000) {
            throw new AppException(ErrorCode.EXPORT_VOLUME_EXCEEDED);
        }

        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("OJT Students");

            // Header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"No.", "Student Code", "Full Name", "Email", "Major", "GPA", "Semester", "Status"};
            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }

            // Data rows
            int rowIdx = 1;
            for (EligibleStudent student : students) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue((double) rowIdx - 1);
                row.createCell(1).setCellValue(student.getStudentCode());
                row.createCell(2).setCellValue(student.getFullName());
                row.createCell(3).setCellValue(student.getEmail() != null ? student.getEmail() : "");
                row.createCell(4).setCellValue(student.getMajor());
                row.createCell(5)
                        .setCellValue(
                                student.getGpa() != null ? student.getGpa().doubleValue() : 0.0);
                row.createCell(6).setCellValue(student.getCurrentSemester() != null ? student.getCurrentSemester() : 0);
                row.createCell(7).setCellValue(student.getStatus());
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Failed to export OJT students to Excel", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public EligibleStudent cancelOjtResult(UUID id, String reason) {
        EligibleStudent student =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        // Resolve the actor from the security context so DB constraint
        // chk_cancel_audit (cancelled_by NOT NULL when status = CANCELLED) is satisfied.
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext()
                        .getAuthentication();
        if (authentication == null
                || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String actorEmail = authentication.getName();
        com.ueims.model.entity.User actor = userRepository
                .findByEmail(actorEmail)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        // Admin-only when cancelling an active OJT (BR-24, mirrors DB trigger trg_locked_student_edit).
        if ("OJT".equals(student.getStatus())) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                throw new AppException(ErrorCode.ADMIN_INTERVENTION_REQUIRED);
            }
        }

        student.setStatus("CANCELLED");
        student.setCancelledReason(reason);
        student.setCancelledBy(actor);

        return repository.save(student);
    }
}
