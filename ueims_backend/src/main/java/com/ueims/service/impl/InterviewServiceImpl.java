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
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.InternshipPlan;
import com.ueims.model.entity.InternshipPlanItem;
import com.ueims.model.entity.Interview;
import com.ueims.model.entity.PlacementApplication;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.InternshipPlanItemRepository;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.repository.InterviewRepository;
import com.ueims.repository.PlacementApplicationRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.ApplicationService;
import com.ueims.service.EnterpriseAssignmentService;
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
    PlacementApplicationRepository placementApplicationRepository;
    EligibleStudentRepository eligibleStudentRepository;
    SemesterRepository semesterRepository;
    MailService mailService;
    NotificationService notificationService;
    ApplicationService applicationService;
    EnterpriseAssignmentService enterpriseAssignmentService;
    InternshipPlanRepository internshipPlanRepository;
    InternshipPlanItemRepository internshipPlanItemRepository;

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
        return repository.findByEnterpriseId(enterpriseId);
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
            throw new AppException(
                    ErrorCode.INTERVIEW_DATE_MUST_BE_IN_FUTURE, "Received time: " + entity.getScheduledTime());
        }

        Application application = applicationRepository
                .findById(entity.getApplication().getApplicationId())
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        // BR-34: Kiểm tra quyền sở hữu (Enterprise chỉ được lên lịch cho Job Post của
        // mình)
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
                && application.getStatus() != ApplicationStatus.INTERVIEW_SCHEDULED
                && application.getStatus() != ApplicationStatus.PENDING) {
            throw new AppException(ErrorCode.INTERVIEW_ELIGIBILITY_RULE);
        }

        // BR-35: Kiểm tra trùng lịch (Giả định repository có method check overlap)
        // Logic: Kiểm tra xem Enterprise này đã có lịch nào trong khoảng thời gian này
        // chưa
        boolean isOverlapping = repository.existsByEnterpriseAndTime(
                currentUser.getEnterprise().getEnterpriseId(), entity.getScheduledTime());
        if (isOverlapping) {
            throw new AppException(ErrorCode.INTERVIEW_OVERLAP);
        }

        // Cập nhật trạng thái đơn ứng tuyển
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        entity.setApplication(application);
        Interview saved = repository.saveAndFlush(entity);

        // 43.0: send email + in-app notification to the student (43.0.E2 logged on
        // failure)
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
                && application.getStatus() != ApplicationStatus.INTERVIEW_SCHEDULED
                && application.getStatus() != ApplicationStatus.PENDING) {
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
                .build();

        Interview saved = repository.saveAndFlush(entity);
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

        // BR-49: Không thể xác nhận nếu phỏng vấn đã bị hủy (CANCELLED/CANCELED)
        if ("CANCELLED".equalsIgnoreCase(interview.getStatus()) || "CANCELED".equalsIgnoreCase(interview.getStatus())) {
            throw new AppException(ErrorCode.APPLICATION_STATUS_CHANGED);
        }
        // Không cho xác nhận lại nếu đã xác nhận rồi
        if (Boolean.TRUE.equals(interview.getStudentConfirmed())) {
            throw new AppException(ErrorCode.INTERVIEW_ALREADY_CONFIRMED);
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
        checkEnterpriseOwnershipOrTm(existing, currentUser);

        // BR-35: future time required when rescheduling
        boolean timeChanged = false;
        if (entity.getScheduledTime() != null) {
            if (entity.getScheduledTime().isBefore(LocalDateTime.now())) {
                throw new AppException(ErrorCode.INTERVIEW_DATE_MUST_BE_IN_FUTURE);
            }
            if (!entity.getScheduledTime().equals(existing.getScheduledTime())) {
                existing.setStudentConfirmed(false);
                existing.setRescheduleReason("Schedule updated by " + getActorLabel(currentUser));
                timeChanged = true;
            }
            existing.setScheduledTime(entity.getScheduledTime());
        }
        if (entity.getDurationMinutes() != null) existing.setDurationMinutes(entity.getDurationMinutes());
        if (entity.getMeetingLink() != null) existing.setMeetingLink(entity.getMeetingLink());
        if (entity.getLocation() != null) existing.setLocation(entity.getLocation());
        if (entity.getStatus() != null) {
            String newStatus = entity.getStatus().toUpperCase();
            if ("COMPLETED".equals(newStatus) && !"COMPLETED".equals(existing.getStatus())) {
                if (existing.getScheduledTime() != null
                        && existing.getScheduledTime().isAfter(LocalDateTime.now())) {
                    throw new AppException(ErrorCode.INTERVIEW_PREMATURE_COMPLETION);
                }
            }
            existing.setStatus(newStatus);
        }
        if (entity.getFeedback() != null) existing.setFeedback(entity.getFeedback());
        existing.setUpdatedAt(LocalDateTime.now());

        Interview saved = repository.saveAndFlush(existing);

        if (timeChanged) {
            // 43.2: send reschedule email to student
            try {
                mailService.sendInterviewRescheduled(saved);
                notificationService.notifyInterviewRescheduled(saved);
            } catch (Exception ex) {
                log.warn("[UC-43 43.2] Reschedule notification failed: {}", ex.getMessage());
            }
        }
        return saved;
    }

    @Override
    @Transactional
    public Interview recordResult(UUID id, String result, String notes) {
        Interview existing = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        User currentUser = getCurrentUser();
        checkEnterpriseOwnershipOrTm(existing, currentUser);

        // Removed BR-37 check to allow recording result without explicitly marking
        // COMPLETED first
        // TC-ENT-039: Trạng thái COMPLETED chỉ được phép thiết lập sau khi buổi phỏng
        // vấn đã diễn ra thực tế
        if (existing.getScheduledTime() != null && existing.getScheduledTime().isAfter(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INTERVIEW_PREMATURE_COMPLETION);
        }
        // BR-44: rejection requires notes
        if ("FAIL".equalsIgnoreCase(result) && (notes == null || notes.isBlank())) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }

        // [FIX I-03] Validate result không được null và phải là PASS hoặc FAIL
        if (result == null || result.isBlank()) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }
        String upper = result.toUpperCase();
        if (!upper.equals("PASS") && !upper.equals("FAIL")) {
            throw new AppException(ErrorCode.INVALID_PARAMETER_FORMAT);
        }
        existing.setResult(upper);
        existing.setFeedback(notes);
        existing.setStatus("COMPLETED");
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setDecidedBy(currentUser);

        // Update application status accordingly
        Application app = existing.getApplication();
        if ("PASS".equals(upper)) {
            app.setStatus(ApplicationStatus.ACCEPTED);
            // BR-26: delegated to ApplicationService so the rule lives in one place.
            applicationService.withdrawOtherApplicationsInSemester(app, "Interview PASS");

            // Auto-create placement_applications + enterprise_assignments on PASS.
            // The enterprise that posted the job the student just passed becomes their OJT placement.
            // Student status in eligible_students is updated to MATCHED so they appear in the
            // OJT Placement Center view immediately.
            try {
                autoCreatePlacementAfterInterview(existing);
            } catch (Exception ex) {
                log.error(
                        "[UC-44] Failed to auto-create placement for student {} after interview {}: {}",
                        app.getStudent().getUserId(),
                        id,
                        ex.getMessage());
            }
        } else if ("FAIL".equals(upper)) {
            app.setStatus(ApplicationStatus.REJECTED);
            app.setRejectionReason(notes);
        }
        applicationRepository.save(app);

        Interview saved = repository.saveAndFlush(existing);
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
        checkEnterpriseOwnershipOrTm(existing, currentUser);
        existing.setStatus("CANCELLED");
        existing.setCancelReason(reason);
        existing.setCanceledAt(LocalDateTime.now());
        existing.setStudentConfirmed(false);
        existing.setUpdatedAt(LocalDateTime.now());
        Interview saved = repository.saveAndFlush(existing);

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
    public Interview reschedule(UUID id, LocalDateTime newTime, String reason, String meetingLink, String location) {
        if (newTime == null) {
            throw new AppException(ErrorCode.MISSING_PARAMETER, "newTime is required");
        }
        if (newTime.isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INTERVIEW_DATE_MUST_BE_IN_FUTURE);
        }
        Interview existing = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        User currentUser = getCurrentUser();
        checkEnterpriseOwnershipOrTm(existing, currentUser);
        // BR-35: also check overlap
        UUID enterpriseIdToCheck =
                existing.getApplication().getJobPost().getEnterprise().getEnterpriseId();
        boolean overlap = repository.existsByEnterpriseAndTime(enterpriseIdToCheck, newTime);
        if (overlap) {
            throw new AppException(ErrorCode.INTERVIEW_OVERLAP);
        }
        existing.setScheduledTime(newTime);
        existing.setStatus("SCHEDULED");
        existing.setRescheduleReason(reason);
        if (meetingLink != null) existing.setMeetingLink(meetingLink);
        if (location != null) existing.setLocation(location);
        existing.setStudentConfirmed(false);
        existing.setUpdatedAt(LocalDateTime.now());
        Interview saved = repository.saveAndFlush(existing);
        try {
            mailService.sendInterviewRescheduled(saved);
            notificationService.notifyInterviewRescheduled(saved);
        } catch (Exception ex) {
            log.warn("[UC-43 43.2] Reschedule notification failed: {}", ex.getMessage());
        }
        return saved;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<LocalDateTime> proposeSlots(UUID applicationId) {
        // 43.1: suggest 3 open slots in the next 7 business days (9-12, 14-17) that
        // don't overlap.
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

    private void checkEnterpriseOwnershipOrTm(Interview existing, User currentUser) {
        boolean isTm = currentUser.getRoles().stream()
                .anyMatch(r -> "TRAINING_MANAGER".equals(r.getRole().getRoleName()));
        if (isTm) return;
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
    }

    private String getActorLabel(User user) {
        if (user == null || user.getRoles() == null || user.getRoles().isEmpty()) {
            return "SYSTEM";
        }
        return user.getRoles().stream()
                .map(ur -> ur.getRole() == null ? "USER" : ur.getRole().getRoleName())
                .filter(r -> r != null && !r.isBlank())
                .findFirst()
                .orElse("USER");
    }

    /**
     * Auto-creates placement_applications (APPROVED) + enterprise_assignments (ACTIVE) for a
     * student who just passed an interview.
     *
     * <p>The enterprise is derived from the job post associated with the passed application. The
     * semester is derived from the same job post. Student status in eligible_students is set to
     * MATCHED so they appear in the OJT Placement Center immediately.
     *
     * <p>This mirrors the logic in PlacementApplicationServiceImpl.approve() but skips the pending
     * step since the enterprise already selected the student via interview.
     */
    private void autoCreatePlacementAfterInterview(Interview interview) {
        Application application = interview.getApplication();
        User student = application.getStudent();
        Enterprise enterprise = application.getJobPost().getEnterprise();
        Semester semester = application.getJobPost().getSemester();

        // Guard: only APPROVED enterprises get placements
        if (!"APPROVED".equals(enterprise.getStatus())) {
            log.warn(
                    "[autoCreatePlacement] Skipping placement — enterprise {} status is {}",
                    enterprise.getEnterpriseId(),
                    enterprise.getStatus());
            return;
        }

        // Guard: locked semester → skip
        if ("LOCKED".equals(semester.getStatus())) {
            log.warn("[autoCreatePlacement] Skipping placement — semester {} is LOCKED", semester.getSemesterId());
            return;
        }

        // Skip if student already has an ACTIVE assignment for this enterprise in this semester
        if (enterpriseAssignmentRepository.existsByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
                student.getUserId(), enterprise.getEnterpriseId(), semester.getSemesterId())) {
            log.info(
                    "[autoCreatePlacement] Student {} already assigned to enterprise {} — skipping",
                    student.getUserId(),
                    enterprise.getEnterpriseId());
            return;
        }

        // Create placement application (APPROVED — no pending step since enterprise selected via
        // interview)
        PlacementApplication placementApp = PlacementApplication.builder()
                .student(student)
                .enterprise(enterprise)
                .semester(semester)
                .status("APPROVED")
                .coverLetter("[Interview Pass] Auto-placed after passing interview with " + enterprise.getCompanyName())
                .reviewedBy(currentUser())
                .reviewedAt(LocalDateTime.now())
                .isReplacement(false)
                .build();
        placementApplicationRepository.save(placementApp);

        // Create assignment (ACTIVE)
        EnterpriseAssignment assignment = EnterpriseAssignment.builder()
                .enterprise(enterprise)
                .student(student)
                .semester(semester)
                .status("ACTIVE")
                .assignedBy(currentUser())
                .build();
        enterpriseAssignmentRepository.save(assignment);

        // Auto-complete assignment ACTIVE cũ ở kỳ khác (SV đã lên kỳ mới qua interview)
        enterpriseAssignmentService.autoCompletePriorActiveAssignments(student.getUserId(), semester.getSemesterId());

        // Auto clone internship plan if there is an approved master plan for this JobPost
        List<InternshipPlan> masterPlans = internshipPlanRepository.findByJobPost_JobPostId(
                application.getJobPost().getJobPostId());
        if (!masterPlans.isEmpty()) {
            InternshipPlan masterPlan = masterPlans.get(0);
            if ("APPROVED".equals(masterPlan.getStatus())) {
                InternshipPlan studentPlan = InternshipPlan.builder()
                        .assignment(assignment)
                        .overallGoal(masterPlan.getOverallGoal())
                        .status("APPROVED")
                        .build();
                internshipPlanRepository.save(studentPlan);

                List<InternshipPlanItem> masterItems =
                        internshipPlanItemRepository.findByPlan_PlanId(masterPlan.getPlanId());
                for (InternshipPlanItem item : masterItems) {
                    InternshipPlanItem clonedItem = InternshipPlanItem.builder()
                            .plan(studentPlan)
                            .weekNumber(item.getWeekNumber())
                            .taskDescription(item.getTaskDescription())
                            .targetDate(item.getTargetDate())
                            .status("PENDING")
                            .orderIndex(item.getOrderIndex())
                            .build();
                    internshipPlanItemRepository.save(clonedItem);
                }
                log.info(
                        "[autoCreatePlacement] Cloned master plan to student assignment {}",
                        assignment.getAssignmentId());
            }
        }

        // Update eligible_students status → MATCHED so student appears in OJT view
        eligibleStudentRepository
                .findByUser_UserIdAndSemester_SemesterId(student.getUserId(), semester.getSemesterId())
                .ifPresent(eligible -> {
                    if (!"MATCHED".equals(eligible.getStatus()) && !"OJT".equals(eligible.getStatus())) {
                        eligible.setStatus("MATCHED");
                        eligibleStudentRepository.save(eligible);
                        log.info(
                                "[autoCreatePlacement] Student {} eligible status updated to MATCHED (semester {})",
                                student.getUserId(),
                                semester.getSemesterId());
                    }
                });

        log.info(
                "[autoCreatePlacement] Student {} auto-placed to {} (assignment {})",
                student.getUserId(),
                enterprise.getCompanyName(),
                assignment.getAssignmentId());
    }

    /** Shortcut to fetch the current authenticated user without repeating boilerplate. */
    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }
}
