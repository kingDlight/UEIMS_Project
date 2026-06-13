package com.ueims.service.impl;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ueims.dto.request.WeeklyReportRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.User;
import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.WeeklyReportRepository;
import com.ueims.service.WeeklyReportService;
import com.ueims.util.HtmlSanitizer;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WeeklyReportServiceImpl implements WeeklyReportService {
    WeeklyReportRepository repository;
    UserRepository userRepository;
    EligibleStudentRepository eligibleStudentRepository;
    EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    public List<WeeklyReport> findAll() {
        return repository.findAll();
    }

    @Override
    public List<WeeklyReport> findMyReports() {
        User currentUser = getCurrentUser();
        return repository.findByAssignment_Student_UserId(currentUser.getUserId());
    }

    @Override
    public WeeklyReport findById(UUID id) {
        WeeklyReport report = repository.findById(id).orElse(null);
        if (report == null) {
            return null;
        }

        User currentUser = getCurrentUser();
        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("SYSTEM_ADMIN")
                        || role.getRole().getRoleName().equals("TRAINING_MANAGER"));
        if (isStaff) {
            return report;
        }

        // If it's an Enterprise user, check if they are the supervisor assigned to this student
        if (currentUser.getEnterprise() != null) {
            if (!report.getAssignment()
                    .getEnterprise()
                    .getEnterpriseId()
                    .equals(currentUser.getEnterprise().getEnterpriseId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            return report;
        }

        // If it's a Student, check if they are the owner
        if (!report.getAssignment().getStudent().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return report;
    }

    @Override
    public WeeklyReport save(WeeklyReport entity) {
        User currentUser = getCurrentUser();

        EnterpriseAssignment assignment = enterpriseAssignmentRepository
                .findById(entity.getAssignment().getAssignmentId())
                .orElseThrow(() -> new AppException(ErrorCode.FIELD_REQUIRED));

        // Enforce ownership
        if (!currentUser.getUserId().equals(assignment.getStudent().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Validate Eligible Student
        eligibleStudentRepository
                .findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), assignment.getSemester().getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE));

        // BR-52: Weekly Report Submission Window
        LocalDate startDate = assignment.getSemester().getStartDate();
        long currentWeek = ChronoUnit.WEEKS.between(startDate, LocalDate.now()) + 1;

        if (entity.getWeekNumber() != (int) currentWeek) {
            throw new AppException(ErrorCode.APPLICATION_DEADLINE_EXPIRED);
        }

        entity.setAssignment(assignment);
        return repository.save(entity);
    }

    @Override
    public WeeklyReport updateReport(UUID id, WeeklyReportRequest request) {
        WeeklyReport existing = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.FIELD_REQUIRED));

        User currentUser = getCurrentUser();
        if (!currentUser
                .getUserId()
                .equals(existing.getAssignment().getStudent().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-53: Weekly Report Edit Constraint (Only allow editing if DRAFT or REJECTED)
        String status = existing.getStatus();
        if ("APPROVED".equals(status) || "PENDING_REVIEW".equals(status) || "REVIEWED".equals(status)) {
            throw new AppException(ErrorCode.APPLICATION_STATUS_CHANGED);
        }

        if (request.getTasksCompleted() != null)
            existing.setTasksCompleted(HtmlSanitizer.sanitize(request.getTasksCompleted()));
        if (request.getIssuesChallenges() != null)
            existing.setIssuesChallenges(HtmlSanitizer.sanitize(request.getIssuesChallenges()));
        if (request.getLessonsLearned() != null)
            existing.setLessonsLearned(HtmlSanitizer.sanitize(request.getLessonsLearned()));
        if (request.getPlanNextWeek() != null)
            existing.setPlanNextWeek(HtmlSanitizer.sanitize(request.getPlanNextWeek()));
        if (request.getAttachmentUrls() != null) existing.setAttachmentUrls(request.getAttachmentUrls());
        if (request.getStatus() != null) existing.setStatus(request.getStatus());
        return repository.save(existing);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteById(UUID id) {
        WeeklyReport report = repository.findById(id).orElse(null);
        if (report == null) {
            return;
        }
        User currentUser = getCurrentUser();
        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("SYSTEM_ADMIN")
                        || role.getRole().getRoleName().equals("TRAINING_MANAGER"));
        if (!isStaff && !report.getAssignment().getStudent().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        repository.deleteById(id);
    }
}
