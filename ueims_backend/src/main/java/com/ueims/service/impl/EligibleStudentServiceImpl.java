package com.ueims.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.request.EligibleStudentUpdateRequest;
import com.ueims.dto.request.StudentImportRow;
import com.ueims.dto.response.EligibleStudentResponse;
import com.ueims.dto.response.StudentImportResult;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.Role;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.StudentProfile;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.RoleRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.StudentProfileRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.UserRoleRepository;
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
    static final String DEFAULT_IMPORT_PASSWORD = "Password@123";
    static final String STUDENT_ROLE = "STUDENT";

    EligibleStudentRepository repository;
    SemesterRepository semesterRepository;
    UserRepository userRepository;
    StudentProfileRepository studentProfileRepository;
    RoleRepository roleRepository;
    UserRoleRepository userRoleRepository;
    PasswordEncoder passwordEncoder;

    @Override
    public List<EligibleStudent> findAll() {
        return repository.findAll();
    }

    @Override
    public List<EligibleStudent> findBySemesterId(UUID semesterId) {
        return repository.findBySemester_SemesterId(semesterId);
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

        EligibleStudent saved = repository.save(existing);

        // Sync official school-issued data (gpa, full_name, email, major) into
        // student_profiles so the student's self-service profile reflects the
        // authoritative record imported by Training Manager. Students are NOT
        // allowed to edit these fields themselves — only the school can.
        syncOfficialDataToProfile(saved);

        return saved;
    }

    /**
     * Mirror school-issued fields from eligible_students → student_profiles.
     * Idempotent: if no profile exists yet, create one with student_code matching.
     */
    private void syncOfficialDataToProfile(EligibleStudent es) {
        if (es.getUser() == null || es.getUser().getUserId() == null) {
            return;
        }
        UUID userId = es.getUser().getUserId();
        try {
            StudentProfile profile = studentProfileRepository.findByUser_UserId(userId);
            if (profile == null) {
                // Create a minimal profile row mirroring the school-issued data.
                profile = StudentProfile.builder()
                        .user(es.getUser())
                        .studentCode(es.getStudentCode())
                        .major(es.getMajor())
                        .gpa(es.getGpa())
                        .build();
            } else {
                profile.setStudentCode(es.getStudentCode());
                profile.setMajor(es.getMajor());
                profile.setGpa(es.getGpa());
            }
            studentProfileRepository.save(profile);
        } catch (Exception ex) {
            // Sync is best-effort; don't fail the eligibility update if profile sync breaks.
            log.warn("Failed to sync eligible_student → student_profiles for user {}: {}", userId, ex.getMessage());
        }
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
    @Transactional
    public StudentImportResult importRoster(MultipartFile file, UUID semesterId) {
        Semester semester = semesterRepository
                .findById(semesterId)
                .orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));

        List<StudentImportRow> rows;
        try {
            rows = ExcelImportUtil.parseStudentImportRows(file.getInputStream());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse TM roster Excel", e);
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }

        StudentImportResult result = StudentImportResult.builder()
                .totalRows(rows.size())
                .build();

        // Track student codes that already triggered an email-collision error in
        // this import — avoids spamming the error list for 100 rows pointing at
        // the same wrong email.
        Set<String> reportedCollisions = new HashSet<>();

        for (int i = 0; i < rows.size(); i++) {
            StudentImportRow row = rows.get(i);
            int excelRowNumber = i + 2; // +1 for header, +1 to make it 1-based
            try {
                UpsertOutcome outcome = upsertStudentFromRow(row, semester, reportedCollisions);
                switch (outcome) {
                    case CREATED -> result.setCreated(result.getCreated() + 1);
                    case UPDATED -> result.setUpdated(result.getUpdated() + 1);
                    case SKIPPED_DUPLICATE -> result.setSkipped(result.getSkipped() + 1);
                }
            } catch (AppException e) {
                result.getErrors().add(StudentImportResult.RowError.builder()
                        .row(excelRowNumber)
                        .studentCode(row.getStudentCode())
                        .reason(e.getErrorCode() != null ? e.getErrorCode().getMessage() : e.getMessage())
                        .build());
            } catch (Exception e) {
                log.error("Unexpected failure on roster row {}", excelRowNumber, e);
                result.getErrors().add(StudentImportResult.RowError.builder()
                        .row(excelRowNumber)
                        .studentCode(row.getStudentCode())
                        .reason("Unexpected error: " + e.getMessage())
                        .build());
            }
        }

        log.info(
                "Roster import complete — semester={} total={} created={} updated={} skipped={} errors={}",
                semesterId, result.getTotalRows(), result.getCreated(), result.getUpdated(),
                result.getSkipped(), result.getErrors().size());
        return result;
    }

    /** Per-row resolution outcome, used to build the import summary. */
    private enum UpsertOutcome {
        CREATED, UPDATED, SKIPPED_DUPLICATE
    }

    /**
     * Resolves a single {@link StudentImportRow} against the database. The
     * semester is passed in by the controller — the {@code semesterNameOrCode}
     * on the row is currently informational, not authoritative.
     */
    private UpsertOutcome upsertStudentFromRow(
            StudentImportRow row, Semester semester, Set<String> reportedCollisions) {

        // (studentCode, semester) dedup check first — cheap.
        if (repository.existsByStudentCodeAndSemester_SemesterId(row.getStudentCode(), semester.getSemesterId())) {
            return UpsertOutcome.SKIPPED_DUPLICATE;
        }

        // Find existing user via email first, then via studentCode (linked profile).
        Optional<User> userOpt = userRepository.findByEmail(row.getEmail());
        boolean createdUser = false;
        if (userOpt.isEmpty()) {
            userOpt = studentProfileRepository
                    .findByStudentCode(row.getStudentCode())
                    .map(StudentProfile::getUser);
        }
        User user;
        if (userOpt.isEmpty()) {
            // Brand new student — create user, profile and assign STUDENT role.
            if (userRepository.existsByEmail(row.getEmail())) {
                // Race / data quirk: row email matches an account that
                // studentProfile lookup didn't find. Skip rather than corrupt.
                reportCollisionOnce(reportedCollisions, row.getEmail());
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
            user = createNewStudentUser(row);
            createdUser = true;
        } else {
            user = userOpt.get();
            // Email changed for an existing account — guard against collision.
            if (!user.getEmail().equalsIgnoreCase(row.getEmail())
                    && userRepository.existsByEmail(row.getEmail())) {
                reportCollisionOnce(reportedCollisions, row.getEmail());
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
            updateExistingStudentUser(user, row);
        }

        // Upsert the linked StudentProfile (1-1 with user).
        StudentProfile profile = studentProfileRepository.findByUser_UserId(user.getUserId());
        if (profile == null) {
            profile = StudentProfile.builder()
                    .user(user)
                    .studentCode(row.getStudentCode())
                    .build();
        }
        applyProfileFields(profile, row);
        studentProfileRepository.save(profile);

        // Create a new EligibleStudent record for the given semester. The
        // status defaults to ELIGIBLE — TM can change it manually.
        EligibleStudent eligible = EligibleStudent.builder()
                .semester(semester)
                .user(user)
                .studentCode(row.getStudentCode())
                .fullName(row.getFullName())
                .email(row.getEmail())
                .major(row.getMajor())
                .gpa(row.getGpa())
                .currentSemester(row.getCurrentSemester())
                .status("ELIGIBLE")
                .isLocked(false)
                .importedAt(LocalDateTime.now())
                .build();
        repository.save(eligible);

        return createdUser ? UpsertOutcome.CREATED : UpsertOutcome.UPDATED;
    }

    private User createNewStudentUser(StudentImportRow row) {
        User user = User.builder()
                .email(row.getEmail())
                .password(passwordEncoder.encode(DEFAULT_IMPORT_PASSWORD))
                .fullName(row.getFullName())
                .phone(row.getPhone())
                .authProvider("LOCAL")
                .status("ACTIVE")
                .mustChangePassword(false)
                .passwordChangedAt(LocalDateTime.now())
                .build();
        user = userRepository.save(user);

        Role studentRole = roleRepository.findById(STUDENT_ROLE).orElseGet(() -> roleRepository.save(Role.builder()
                .roleName(STUDENT_ROLE)
                .description("Student role")
                .isActive(true)
                .build()));
        userRoleRepository.save(UserRole.builder()
                .id(new UserRoleId(user.getUserId(), studentRole.getRoleName()))
                .user(user)
                .role(studentRole)
                .build());
        return user;
    }

    private void updateExistingStudentUser(User user, StudentImportRow row) {
        user.setFullName(row.getFullName());
        user.setPhone(row.getPhone());
        user.setEmail(row.getEmail());
        // Product decision: every periodic import resets the password to the
        // shared default so the TM can always hand the student their creds
        // (e.g. after the student forgot). mustChangePassword stays as-is.
        user.setPassword(passwordEncoder.encode(DEFAULT_IMPORT_PASSWORD));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private void applyProfileFields(StudentProfile profile, StudentImportRow row) {
        profile.setStudentCode(row.getStudentCode());
        profile.setMajor(row.getMajor());
        profile.setGpa(row.getGpa());
        if (row.getClassCode() != null) profile.setClassCode(row.getClassCode());
        if (row.getDateOfBirth() != null) profile.setDateOfBirth(row.getDateOfBirth());
        if (row.getGender() != null) profile.setGender(row.getGender());
        if (row.getAddress() != null) profile.setAddress(row.getAddress());
        if (row.getSkills() != null) profile.setSkills(row.getSkills());
        if (row.getLinkedinUrl() != null) profile.setLinkedinUrl(row.getLinkedinUrl());
        if (row.getGithubUrl() != null) profile.setGithubUrl(row.getGithubUrl());
        if (row.getPortfolioUrl() != null) profile.setPortfolioUrl(row.getPortfolioUrl());
        if (row.getBio() != null) profile.setBio(row.getBio());
    }

    private void reportCollisionOnce(Set<String> reported, String email) {
        if (reported.add(email)) {
            log.warn("Email collision detected for {}", email);
        }
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

            // Header row — the same columns the TM roster importer understands
            // (see ExcelImportUtil.parseStudentImportRows for matching).
            Row headerRow = sheet.createRow(0);
            String[] columns = {
                    "No.",
                    "Student Code",
                    "Full Name",
                    "Email",
                    "Major",
                    "GPA",
                    "Current Semester",
                    "Semester",
                    "Status",
                    "Phone",
                    "Class Code",
                    "Date Of Birth",
                    "Gender",
                    "Address",
                    "Skills",
                    "LinkedIn",
                    "GitHub",
                    "Portfolio",
                    "Bio",
            };
            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }

            // Data rows
            int rowIdx = 1;
            for (EligibleStudent student : students) {
                Row row = sheet.createRow(rowIdx++);
                StudentProfile profile = student.getUser() != null
                        ? studentProfileRepository.findByUser_UserId(student.getUser().getUserId())
                        : null;

                row.createCell(0).setCellValue((double) rowIdx - 1);
                row.createCell(1).setCellValue(student.getStudentCode());
                row.createCell(2).setCellValue(student.getFullName());
                row.createCell(3).setCellValue(student.getEmail() != null ? student.getEmail() : "");
                row.createCell(4).setCellValue(student.getMajor());
                row.createCell(5)
                        .setCellValue(
                                student.getGpa() != null ? student.getGpa().doubleValue() : 0.0);
                row.createCell(6).setCellValue(student.getCurrentSemester() != null ? student.getCurrentSemester() : 0);
                row.createCell(7).setCellValue(student.getSemester() != null ? student.getSemester().getName() : "");
                row.createCell(8).setCellValue(student.getStatus());
                row.createCell(9).setCellValue(student.getUser() != null && student.getUser().getPhone() != null
                        ? student.getUser().getPhone()
                        : "");
                row.createCell(10).setCellValue(profile != null && profile.getClassCode() != null ? profile.getClassCode() : "");
                row.createCell(11).setCellValue(profile != null && profile.getDateOfBirth() != null
                        ? profile.getDateOfBirth().toString()
                        : "");
                row.createCell(12).setCellValue(profile != null && profile.getGender() != null ? profile.getGender() : "");
                row.createCell(13).setCellValue(profile != null && profile.getAddress() != null ? profile.getAddress() : "");
                row.createCell(14).setCellValue(profile != null && profile.getSkills() != null ? profile.getSkills() : "");
                row.createCell(15).setCellValue(profile != null && profile.getLinkedinUrl() != null
                        ? profile.getLinkedinUrl()
                        : "");
                row.createCell(16).setCellValue(profile != null && profile.getGithubUrl() != null
                        ? profile.getGithubUrl()
                        : "");
                row.createCell(17).setCellValue(profile != null && profile.getPortfolioUrl() != null
                        ? profile.getPortfolioUrl()
                        : "");
                row.createCell(18).setCellValue(profile != null && profile.getBio() != null ? profile.getBio() : "");
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

        // UC-25: Only students with OJT status can have their result cancelled (BR-24).
        // The controller endpoint is already restricted to ROLE_TRAINING_MANAGER via @PreAuthorize.
        if (!"OJT".equals(student.getStatus())) {
            throw new AppException(ErrorCode.INVALID_STATUS_FOR_OJT);
        }

        student.setStatus("CANCELLED");
        student.setCancelledReason(reason);
        student.setCancelledBy(actor);

        return repository.save(student);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public EligibleStudent deferStudent(UUID eligibleId, String reason) {
        EligibleStudent student = repository
                .findById(eligibleId)
                .orElseThrow(() -> new AppException(ErrorCode.ELIGIBLE_STUDENT_NOT_FOUND));

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

        student.setDeferredReason(reason);
        student.setDeferredBy(actor);
        student.setDeferredAt(LocalDateTime.now());

        return repository.save(student);
    }
}
