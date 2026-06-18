package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.InterviewRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Application;
import com.ueims.model.entity.ApplicationStatus;
import com.ueims.model.entity.Interview;
import com.ueims.model.entity.User;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.InterviewRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.InterviewService;
import com.ueims.service.MailService;
import com.ueims.service.NotificationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InterviewServiceImpl implements InterviewService {
    InterviewRepository repository;
    ApplicationRepository applicationRepository;
    UserRepository userRepository;
    EnterpriseAssignmentRepository enterpriseAssignmentRepository;
    MailService mailService;
    NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<Interview> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Interview> findMyInterviews() {
        User currentUser = getCurrentUser();
        return repository.findByApplication_Student_UserId(currentUser.getUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Interview> findMyEnterpriseInterviews() {
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null) {
            return List.of();
        }
        UUID enterpriseId = currentUser.getEnterprise().getEnterpriseId();
        return repository.findAll().stream()
                .filter(i -> i.getApplication() != null
                        && i.getApplication().getJobPost() != null
                        && i.getApplication().getJobPost().getEnterprise() != null
                        && enterpriseId.equals(
                                i.getApplication().getJobPost().getEnterprise().getEnterpriseId()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Interview findById(UUID id) {
        return repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
    }

    @Override
    @Transactional
    public Interview save(Interview entity) {
        // BR-35: Kiểm tra ngày trong tương lai
        if (entity.getScheduledTime() == null || entity.getScheduledTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INTERVIEW_DATE_MUST_BE_IN_FUTURE, "Received time: " + entity.getScheduledTime());
        }

        Application application = applicationRepository
                .findById(entity.getApplication().getApplicationId())
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        // BR-34: Kiểm tra quyền sở hữu (Enterprise chỉ được lên lịch cho Job Post của mình)
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null
                || !application
                        .getJobPost()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-36: Kiểm tra điều kiện (Chỉ hồ sơ SCREENING_PASSED mới được lên lịch)
        if (application.getStatus() != ApplicationStatus.SCREENING_PASSED
                && application.getStatus() != ApplicationStatus.INTERVIEW_SCHEDULED) {
            throw new AppException(ErrorCode.INTERVIEW_ELIGIBILITY_RULE);
        }

        // BR-35: Kiểm tra trùng lịch (Giả định repository có method check overlap)
        // Logic: Kiểm tra xem Enterprise này đã có lịch nào trong khoảng thời gian này chưa
        boolean isOverlapping = repository.existsByEnterpriseAndTime(
                currentUser.getEnterprise().getEnterpriseId(), entity.getScheduledTime());
        if (isOverlapping) {
            throw new AppException(ErrorCode.INTERVIEW_OVERLAP);
        }

        // Cập nhật trạng thái đơn ứng tuyển
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        Interview saved = repository.save(entity);

        // 43.0: send email + in-app notification to the student (43.0.E2 logged on failure)
        try {
            mailService.sendInterviewScheduled(saved);
            notificationService.notifyInterviewScheduled(saved);
        } catch (Exception ex) {
            // 43.0.E2: email dispatch failure — log warning, keep DB state
            log.warn(
                    "[UC-43 43.0.E2] Notification dispatch failed for interview {}: {}",
                    saved.getInterviewId(),
                    ex.getMessage());
        }
        return saved;
    }

    @Override
    @Transactional
    public Interview create(InterviewRequest request) {
        if (request.getApplicationId() == null) {
            throw new AppException(ErrorCode.MISSING_PARAMETER, "applicationId is required");
        }
        if (request.getScheduledTime() == null || request.getScheduledTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INTERVIEW_DATE_MUST_BE_IN_FUTURE);
        }

        Application application = applicationRepository
                .findById(request.getApplicationId())
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null
                || application.getJobPost() == null
                || application.getJobPost().getEnterprise() == null
                || !application
                        .getJobPost()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (application.getStatus() != ApplicationStatus.SCREENING_PASSED
                && application.getStatus() != ApplicationStatus.INTERVIEW_SCHEDULED) {
            throw new AppException(ErrorCode.INTERVIEW_ELIGIBILITY_RULE);
        }

        boolean isOverlapping = repository.existsByEnterpriseAndTime(
                currentUser.getEnterprise().getEnterpriseId(), request.getScheduledTime());
        if (isOverlapping) {
            throw new AppException(ErrorCode.INTERVIEW_OVERLAP);
        }

        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        Interview entity = Interview.builder()
                .application(application)
                .scheduledTime(request.getScheduledTime())
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 60)
                .location(request.getLocation())
                .meetingLink(request.getMeetingLink())
                .status(request.getStatus() != null ? request.getStatus() : "SCHEDULED")
                .studentConfirmed(Boolean.FALSE)
                .build();

        Interview saved = repository.save(entity);
        try {
            mailService.sendInterviewScheduled(saved);
            notificationService.notifyInterviewScheduled(saved);
        } catch (Exception ex) {
            log.warn(
                    "[UC-43 43.0.E2] Notification dispatch failed for interview {}: {}",
                    saved.getInterviewId(),
                    ex.getMessage());
        }
        return saved;
    }

    @Override
    @Transactional
    public Interview confirmAttendance(UUID id) {
        Interview interview =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));

        // BR-49: Không thể thay đổi nếu đã được xử lý trước đó (Decline)
        if (Boolean.FALSE.equals(interview.getStudentConfirmed())) {
            throw new AppException(ErrorCode.APPLICATION_STATUS_CHANGED);
        }

        interview.setStudentConfirmed(Boolean.TRUE);
        interview.setStatus("CONFIRMED");
        interview.setUpdatedAt(LocalDateTime.now());
        return repository.save(interview);
    }

    @Override
    @Transactional
    public Interview declineAttendance(UUID id, String reason) {
        Interview interview =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));

        // BR-49: Tính không thể đảo ngược
        if (Boolean.TRUE.equals(interview.getStudentConfirmed())) {
            throw new AppException(ErrorCode.INTERVIEW_ALREADY_CONFIRMED);
        }

        interview.setStudentConfirmed(Boolean.FALSE);
        interview.setStatus("CANCELLED");
        interview.setFeedback(reason);
        interview.setUpdatedAt(LocalDateTime.now());

        // UC-58 & BR-49: Từ chối phỏng vấn sẽ tự động từ chối đơn ứng tuyển
        Application application = interview.getApplication();
        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectionReason("Sinh viên từ chối phỏng vấn: " + reason);
        applicationRepository.save(application);

        return repository.save(interview);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public Interview update(UUID id, Interview entity) {
        Interview existing = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        User currentUser = getCurrentUser();

        // Ownership check
        if (currentUser.getEnterprise() == null
                || existing.getApplication() == null
                || existing.getApplication().getJobPost() == null
                || existing.getApplication().getJobPost().getEnterprise() == null
                || !existing.getApplication()
                        .getJobPost()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-35: future time required when rescheduling
        if (entity.getScheduledTime() != null) {
            if (entity.getScheduledTime().isBefore(LocalDateTime.now())) {
                throw new AppException(ErrorCode.INTERVIEW_DATE_MUST_BE_IN_FUTURE);
            }
            existing.setScheduledTime(entity.getScheduledTime());
        }
        if (entity.getDurationMinutes() != null) existing.setDurationMinutes(entity.getDurationMinutes());
        if (entity.getMeetingLink() != null) existing.setMeetingLink(entity.getMeetingLink());
        if (entity.getLocation() != null) existing.setLocation(entity.getLocation());
        if (entity.getStatus() != null) existing.setStatus(entity.getStatus().toUpperCase());
        if (entity.getFeedback() != null) existing.setFeedback(entity.getFeedback());
        existing.setUpdatedAt(LocalDateTime.now());

        Interview saved = repository.save(existing);
        // 43.2: send reschedule email to student
        try {
            mailService.sendInterviewRescheduled(saved);
            notificationService.notifyInterviewRescheduled(saved);
        } catch (Exception ex) {
            log.warn("[UC-43 43.2] Reschedule notification failed: {}", ex.getMessage());
        }
        return saved;
    }

    @Override
    @Transactional
    public Interview recordResult(UUID id, String result, String notes) {
        Interview existing = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        User currentUser = getCurrentUser();

        // Ownership check
        if (currentUser.getEnterprise() == null
                || existing.getApplication() == null
                || existing.getApplication().getJobPost() == null
                || existing.getApplication().getJobPost().getEnterprise() == null
                || !existing.getApplication()
                        .getJobPost()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Removed BR-37 check to allow recording result without explicitly marking COMPLETED first

        // BR-44: rejection requires notes
        if ("FAIL".equalsIgnoreCase(result) && (notes == null || notes.isBlank())) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }

        String upper = result == null ? "PASS" : result.toUpperCase();
        existing.setResult(upper);
        existing.setFeedback(notes);
        existing.setStatus("RESULT_RECORDED");
        existing.setUpdatedAt(LocalDateTime.now());

        // Update application status accordingly
        Application app = existing.getApplication();
        if ("PASS".equals(upper)) {
            app.setStatus(ApplicationStatus.ACCEPTED);

            // Auto-create EnterpriseAssignment
            com.ueims.model.entity.EnterpriseAssignment assignment =
                    com.ueims.model.entity.EnterpriseAssignment.builder()
                            .student(app.getStudent())
                            .enterprise(app.getJobPost().getEnterprise())
                            .semester(app.getJobPost().getSemester())
                            .status("IN_PROGRESS")
                            .build();
            enterpriseAssignmentRepository.save(assignment);
        } else if ("FAIL".equals(upper)) {
            app.setStatus(ApplicationStatus.REJECTED);
            app.setRejectionReason(notes);
        }
        applicationRepository.save(app);

        Interview saved = repository.save(existing);
        // UC-44: send result email to the student
        try {
            mailService.sendInterviewResult(saved, upper, notes);
            notificationService.notifyInterviewResult(saved);
        } catch (Exception ex) {
            log.warn("[UC-44] Result notification failed: {}", ex.getMessage());
        }
        return saved;
    }

    @Override
    @Transactional
    public Interview cancel(UUID id, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }
        Interview existing = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null
                || existing.getApplication() == null
                || existing.getApplication().getJobPost() == null
                || existing.getApplication().getJobPost().getEnterprise() == null
                || !existing.getApplication()
                        .getJobPost()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        existing.setStatus("CANCELED");
        existing.setCancelReason(reason);
        existing.setCanceledAt(LocalDateTime.now());
        existing.setUpdatedAt(LocalDateTime.now());
        Interview saved = repository.save(existing);

        // 43.3: send cancellation email + notification
        try {
            mailService.sendInterviewCanceled(saved, reason);
            notificationService.notifyInterviewCanceled(saved);
        } catch (Exception ex) {
            log.warn("[UC-43 43.3] Cancellation notification failed: {}", ex.getMessage());
        }
        return saved;
    }

    @Override
    @Transactional
    public Interview reschedule(UUID id, LocalDateTime newTime, String reason) {
        if (newTime == null) {
            throw new AppException(ErrorCode.MISSING_PARAMETER, "newTime is required");
        }
        if (newTime.isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INTERVIEW_DATE_MUST_BE_IN_FUTURE);
        }
        Interview existing = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null
                || existing.getApplication() == null
                || existing.getApplication().getJobPost() == null
                || existing.getApplication().getJobPost().getEnterprise() == null
                || !existing.getApplication()
                        .getJobPost()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        // BR-35: also check overlap
        boolean overlap =
                repository.existsByEnterpriseAndTime(currentUser.getEnterprise().getEnterpriseId(), newTime);
        if (overlap) {
            throw new AppException(ErrorCode.INTERVIEW_OVERLAP);
        }
        existing.setScheduledTime(newTime);
        existing.setStatus("RESCHEDULED");
        existing.setRescheduleReason(reason);
        existing.setUpdatedAt(LocalDateTime.now());
        Interview saved = repository.save(existing);
        try {
            mailService.sendInterviewRescheduled(saved);
            notificationService.notifyInterviewRescheduled(saved);
        } catch (Exception ex) {
            log.warn("[UC-43 43.2] Reschedule notification failed: {}", ex.getMessage());
        }
        return saved;
    }

    @Override
    public List<LocalDateTime> proposeSlots(UUID applicationId) {
        // 43.1: suggest 3 open slots in the next 7 business days (9-12, 14-17) that don't overlap.
        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null
                || application.getJobPost() == null
                || !application
                        .getJobPost()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        List<LocalDateTime> slots = new ArrayList<>();
        LocalDateTime cursor = LocalDateTime.now().plusDays(1).with(LocalTime.of(9, 0));
        List<Interview> existing = findMyEnterpriseInterviews();
        while (slots.size() < 3 && cursor.isBefore(LocalDateTime.now().plusDays(14))) {
            if (isValidSlot(cursor, existing)) {
                slots.add(cursor);
            }
            cursor = cursor.plusMinutes(60);
        }
        slots.sort(Comparator.naturalOrder());
        return slots;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private boolean isValidSlot(LocalDateTime candidate, List<Interview> existing) {
        int dow = candidate.getDayOfWeek().getValue();
        if (dow < 1 || dow > 5) return false;

        int hour = candidate.getHour();
        if ((hour < 9 || hour >= 12) && (hour < 14 || hour >= 17)) return false;

        return existing.stream()
                .noneMatch(i -> i.getScheduledTime() != null
                        && Math.abs(java.time.Duration.between(i.getScheduledTime(), candidate)
                                        .toMinutes())
                                < 60);
    }
}
