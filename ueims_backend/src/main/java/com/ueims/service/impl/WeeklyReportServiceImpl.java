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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WeeklyReportServiceImpl implements WeeklyReportService {
    private final WeeklyReportRepository repository;
    private final UserRepository userRepository;
    private final EligibleStudentRepository eligibleStudentRepository;
    private final EnterpriseAssignmentRepository enterpriseAssignmentRepository;

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
        return repository.findById(id).orElse(null);
    }

    @Override
    public WeeklyReport save(WeeklyReport entity) {
        User currentUser = getCurrentUser();

        EnterpriseAssignment assignment = enterpriseAssignmentRepository.findById(entity.getAssignment().getAssignmentId())
                .orElseThrow(() -> new AppException(ErrorCode.FIELD_REQUIRED));

        // Enforce ownership
        if (!currentUser.getUserId().equals(assignment.getStudent().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-XX: Ensure student is eligible
        eligibleStudentRepository
                .findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), assignment.getSemester().getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE));

        // BR-XX: Submission Window Restriction
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
        if (!currentUser.getUserId().equals(existing.getAssignment().getStudent().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Only allow editing if DRAFT or REJECTED
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
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}