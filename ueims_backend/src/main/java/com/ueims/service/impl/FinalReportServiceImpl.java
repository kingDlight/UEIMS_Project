package com.ueims.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.FinalReport;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.FinalReportRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.FinalReportService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FinalReportServiceImpl implements FinalReportService {
    FinalReportRepository repository;
    EnterpriseAssignmentRepository enterpriseAssignmentRepository;
    UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    public List<FinalReport> findAll() {
        return repository.findAll();
    }

    @Override
    public FinalReport findById(UUID id) {
        FinalReport report = repository.findById(id).orElse(null);
        if (report == null) {
            return null;
        }
        User currentUser = getCurrentUser();
        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("SYSTEM_ADMIN")
                        || role.getRole().getRoleName().equals("ADMIN")
                        || role.getRole().getRoleName().equals("TRAINING_MANAGER"));
        if (isStaff) {
            return report;
        }

        // If it's an Enterprise, check assignment
        if (currentUser.getEnterprise() != null) {
            if (!report.getAssignment()
                    .getEnterprise()
                    .getEnterpriseId()
                    .equals(currentUser.getEnterprise().getEnterpriseId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            return report;
        }

        // If it's a Student, check ownership
        if (!report.getAssignment().getStudent().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return report;
    }

    @Override
    public FinalReport findMyReport(UUID studentId) {
        return repository.findByAssignment_Student_UserId(studentId).orElse(null);
    }

    @Override
    public FinalReport save(FinalReport entity) {
        return repository.save(entity);
    }

    @Override
    public FinalReport uploadFinalReport(UUID assignmentId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }

        String filename = StringUtils.getFilename(file.getOriginalFilename());
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new AppException(ErrorCode.FINAL_REPORT_INVALID_FORMAT);
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new AppException(ErrorCode.FINAL_REPORT_SIZE_EXCEEDED);
        }

        EnterpriseAssignment assignment = enterpriseAssignmentRepository
                .findById(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.FIELD_REQUIRED));

        // Enforce ownership
        User currentUser = getCurrentUser();
        if (!assignment.getStudent().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-51: Absolute Hard Deadline (Không cho nộp sau khi Học kỳ đã kết thúc)
        if (java.time.LocalDate.now().isAfter(assignment.getSemester().getEndDate())) {
            throw new AppException(ErrorCode.FINAL_REPORT_DEADLINE_EXPIRED);
        }

        try {
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "final-reports");
            Files.createDirectories(uploadDir);
            String stored =
                    assignmentId.toString() + "_" + System.currentTimeMillis() + "_" + StringUtils.cleanPath(filename);
            Path path = uploadDir.resolve(stored);
            file.transferTo(path.toFile());

            FinalReport report = repository
                    .findByAssignment_AssignmentId(assignmentId)
                    .orElse(FinalReport.builder().assignment(assignment).build());
            report.setAssignment(assignment);
            report.setFileUrl("/uploads/final-reports/" + stored);
            report.setFileSizeBytes((int) file.getSize());
            return repository.save(report);
        } catch (IOException e) {
            log.error("File upload error: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteById(UUID id) {
        FinalReport report = repository.findById(id).orElse(null);
        if (report == null) {
            return;
        }
        User currentUser = getCurrentUser();
        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("SYSTEM_ADMIN")
                        || role.getRole().getRoleName().equals("ADMIN")
                        || role.getRole().getRoleName().equals("TRAINING_MANAGER"));
        if (!isStaff && !report.getAssignment().getStudent().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        repository.deleteById(id);
    }
}
