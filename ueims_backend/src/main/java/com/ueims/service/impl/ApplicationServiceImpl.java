package com.ueims.service.impl;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.ApplicationRequest;
import com.ueims.dto.request.ApplicationScreenRequest;
import com.ueims.dto.response.ApplicationResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.mapper.ApplicationMapper;
import com.ueims.model.entity.Application;
import com.ueims.model.entity.ApplicationStatus;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.Interview;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.Notification;
import com.ueims.model.entity.User;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.InterviewRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.NotificationRepository;
import com.ueims.repository.StudentProfileRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.ApplicationService;
import com.ueims.service.NotificationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationServiceImpl implements ApplicationService {
    private static final Logger log = LoggerFactory.getLogger(ApplicationServiceImpl.class);

    ApplicationRepository repository;
    JobPostRepository jobPostRepository;
    UserRepository userRepository;
    EligibleStudentRepository eligibleStudentRepository;
    StudentProfileRepository studentProfileRepository;
    EnterpriseAssignmentRepository enterpriseAssignmentRepository;
    InterviewRepository interviewRepository;
    NotificationRepository notificationRepository;
    NotificationService notificationService;
    ApplicationMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> findAll() {
        return repository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> findMyApplications() {
        log.info("[DEBUG] findMyApplications called");
        try {
            User currentUser = getCurrentUser();
            log.info("[DEBUG] currentUser: {}", currentUser.getEmail());
            log.info("[DEBUG] currentUser.userId: {}", currentUser.getUserId());
            List<ApplicationResponse> result = repository.findByStudent_UserId(currentUser.getUserId()).stream()
                    .map(this::mapToResponse)
                    .toList();
            log.info("[DEBUG] findMyApplications returning {} results", result.size());
            return result;
        } catch (Exception e) {
            log.error("[DEBUG] findMyApplications failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> findByEnterpriseId(UUID enterpriseId, String search) {
        User currentUser = getCurrentUser();
        UUID enterpriseUUID = enterpriseId;
        if (enterpriseUUID == null) {
            enterpriseUUID = currentUser.getEnterprise() != null
                    ? currentUser.getEnterprise().getEnterpriseId()
                    : null;
        }
        if (enterpriseUUID == null) {
            return List.of();
        }

        if (search != null && !search.trim().isEmpty()) {
            return repository.searchByEnterpriseId(enterpriseUUID, search.trim().toLowerCase()).stream()
                    .map(this::mapToResponse)
                    .toList();
        }
        return repository.findByJobPost_Enterprise_EnterpriseIdAndDeletedAtIsNull(enterpriseUUID).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse findById(UUID id) {
        Application application =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));
        return mapToResponse(application);
    }

    @Override
    @Transactional
    public ApplicationResponse applyForJob(ApplicationRequest request) {
        JobPost jobPost = jobPostRepository
                .findById(request.getJobPostId())
                .orElseThrow(() -> new AppException(ErrorCode.JOB_POST_NOT_FOUND));

        User student;
        if (request.getStudentId() != null) {
            student = userRepository.findById(request.getStudentId()).orElse(null);
        } else {
            student = getCurrentUser();
        }
        if (student == null) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        validateJobPost(jobPost);
        validateStudentEligibility(student, jobPost);
        String cvUrl = getAndValidateCvUrl(request, student);

        // Persist Application entity
        Application entity = Application.builder()
                .jobPost(jobPost)
                .student(student)
                .cvFileUrl(cvUrl)
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.PENDING)
                .build();

        Application saved = repository.save(entity);
        return mapToResponse(saved);
    }

    private void validateJobPost(JobPost jobPost) {
        if ("CLOSED".equalsIgnoreCase(jobPost.getStatus())) {
            throw new AppException(ErrorCode.JOB_POST_CLOSED);
        }
        if (jobPost.getApplicationDeadline() != null && LocalDate.now().isAfter(jobPost.getApplicationDeadline())) {
            throw new AppException(ErrorCode.APPLICATION_DEADLINE_EXPIRED);
        }
    }

    private void validateStudentEligibility(User student, JobPost jobPost) {
        if (enterpriseAssignmentRepository.existsByStudent_UserIdAndSemester_SemesterIdAndStatus(
                student.getUserId(), jobPost.getSemester().getSemesterId(), "ACTIVE")) {
            throw new AppException(ErrorCode.STUDENT_HAS_ACTIVE_PLACEMENT);
        }

        EligibleStudent eligibleStudent = eligibleStudentRepository
                .findByUser_UserIdAndSemester_SemesterId(
                        student.getUserId(), jobPost.getSemester().getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE));
        if (eligibleStudent.getCurrentSemester() == null || eligibleStudent.getCurrentSemester() != 5) {
            throw new AppException(ErrorCode.STUDENT_NOT_IN_SEMESTER_5);
        }
        if (eligibleStudent.getGpa() == null
                || eligibleStudent.getGpa().compareTo(new java.math.BigDecimal("5.0")) < 0) {
            throw new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE);
        }

        // [FIX A-01] Kiểm tra duplicate đúng: chỉ chặn nếu có application chưa kết thúc
        // Terminal statuses: WITHDRAWN, REJECTED, SCREENING_REJECTED
        boolean hasActiveApplication =
                repository.existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotInAndDeletedAtIsNull(
                        jobPost.getJobPostId(),
                        student.getUserId(),
                        java.util.List.of(
                                ApplicationStatus.WITHDRAWN,
                                ApplicationStatus.REJECTED,
                                ApplicationStatus.SCREENING_REJECTED));
        if (hasActiveApplication) {
            throw new AppException(ErrorCode.DUPLICATE_APPLICATION);
        }

        long activeCount = repository.countActiveApplications(student.getUserId());
        if (activeCount >= 3) {
            throw new AppException(ErrorCode.MAX_APPLICATIONS_LIMIT_REACHED);
        }
    }

    private String getAndValidateCvUrl(ApplicationRequest request, User student) {
        String cvUrl = request.getCvFileUrl();
        if (cvUrl == null || cvUrl.trim().isEmpty()) {
            var studentProfile = studentProfileRepository.findByUser_UserId(student.getUserId());
            if (studentProfile != null
                    && studentProfile.getCvFileUrl() != null
                    && !studentProfile.getCvFileUrl().isEmpty()) {
                cvUrl = studentProfile.getCvFileUrl();
            } else {
                throw new AppException(ErrorCode.CV_NOT_UPLOADED);
            }
        }
        cvUrl = cvUrl.trim();

        if (!cvUrl.toLowerCase().endsWith(".pdf")) {
            throw new AppException(ErrorCode.INVALID_CV_FORMAT);
        }

        Long cvSize = request.getCvFileSize();
        if (cvSize != null && cvSize > 5242880) {
            throw new AppException(ErrorCode.CV_SIZE_EXCEEDED);
        }
        return cvUrl;
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public ApplicationResponse withdrawApplication(UUID applicationId) {
        // 1. Get the application
        Application application =
                repository.findById(applicationId).orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        // 2. E1: Ensure the current student owns this application
        User currentUser = getCurrentUser();
        if (!application.getStudent().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // 3. BR-48: Check if application deadline has passed
        JobPost jobPost = application.getJobPost();
        if (jobPost.getApplicationDeadline() != null && LocalDate.now().isAfter(jobPost.getApplicationDeadline())) {
            throw new AppException(ErrorCode.APPLICATION_DEADLINE_EXPIRED);
        }

        // 3. E2: [FIX A-04] Cho phép withdraw khi PENDING hoặc SCREENING_PASSED (trước
        // deadline)
        if (application.getStatus() != ApplicationStatus.PENDING
                && application.getStatus() != ApplicationStatus.SCREENING_PASSED) {
            throw new AppException(ErrorCode.APPLICATION_STATUS_CHANGED);
        }

        // 4. Update status to WITHDRAWN
        application.setStatus(ApplicationStatus.WITHDRAWN);
        Application updated = repository.save(application);

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public ApplicationResponse screenApplication(UUID id, ApplicationScreenRequest request) {
        Application application =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        // BR-33: Chỉ cho phép lọc nếu đang ở trạng thái PENDING
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new AppException(ErrorCode.APPLICATION_STATUS_CHANGED);
        }

        // Kiểm tra quyền: Chỉ Enterprise sở hữu JobPost này mới được lọc CV
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

        // Đảm bảo chỉ được chuyển sang các trạng thái hợp lệ của vòng lọc CV
        if (request.getStatus() != ApplicationStatus.SCREENING_PASSED
                && request.getStatus() != ApplicationStatus.SCREENING_REJECTED) {
            throw new AppException(ErrorCode.INVALID_PARAMETER_FORMAT);
        }

        application.setStatus(request.getStatus());

        if (request.getStatus() == ApplicationStatus.SCREENING_REJECTED) {
            application.setRejectionReason(request.getRejectionReason());
        } else {
            // Đảm bảo xóa lý do cũ nếu trạng thái là PASSED
            application.setRejectionReason(null);
        }

        application.setScreenedBy(currentUser);

        Application savedApp = repository.save(application);

        // BR-26: when this application passes screening, withdraw the student's
        // other PENDING applications in the same semester. The enterprise has
        // committed to interview this student, so we no longer let them keep
        // spamming other job posts. SCREENING_REJECTED intentionally does NOT
        // trigger this branch — the student is free to apply elsewhere.
        if (request.getStatus() == ApplicationStatus.SCREENING_PASSED) {
            withdrawOtherApplicationsInSemester(savedApp, "SCREENING_PASSED");
        }

        return mapToResponse(savedApp);
    }

    @Override
    @Transactional
    public ApplicationResponse updateStatus(UUID id, com.ueims.dto.request.ApplicationStatusUpdateRequest request) {
        Application application =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

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

        // BR-30: Block updates when job post is CLOSED
        if ("CLOSED".equalsIgnoreCase(application.getJobPost().getStatus())) {
            throw new AppException(ErrorCode.JOB_POST_CLOSED);
        }

        // BR-26 finality: a withdrawn application is terminal — the student has been
        // placed elsewhere, so no enterprise (including the one that withdrew it) may
        // resurrect the application. This prevents drag-and-drop from undoing BR-26.
        if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new AppException(ErrorCode.INVALID_PARAMETER_FORMAT);
        }

        // BR-X1 finality: ACCEPTED is a terminal state because BR-26 has already
        // withdrawn every other non-terminal application of this student in the
        // semester. Letting an enterprise drag ACCEPTED back to REJECTED/PENDING
        // would leave sibling applications stranded at WITHDRAWN — the student
        // would be locked out of every enterprise without anyone to blame.
        // If an enterprise truly needs to undo an acceptance, that must go through
        // an admin/supervisor (out of band) — not the Kanban.
        if (application.getStatus() == ApplicationStatus.ACCEPTED) {
            throw new AppException(ErrorCode.INVALID_PARAMETER_FORMAT);
        }

        // Guard: rejecting from INTERVIEW_SCHEDULED requires a reason
        // (misconduct, no-show, disciplinary issue, etc.)
        if (request.getStatus() == ApplicationStatus.REJECTED
                && application.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED) {
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new AppException(ErrorCode.INVALID_PARAMETER_FORMAT);
            }
        }

        // BR-X2: when an enterprise reverts REJECTED → INTERVIEW_SCHEDULED, the
        // previously-cancelled interview must be re-checked. We allow the revert
        // because cancelActiveInterviewsForApplication() already cleaned the
        // interview to CANCELLED state, so no ghost interview remains. The
        // application itself just slides back into the interview bucket. The
        // enterprise must schedule a new interview (handled by InterviewController
        // independently).
        // No additional cascade needed here; cleanup already ran on the forward
        // REJECTED transition.

        application.setStatus(request.getStatus());
        if (request.getStatus() == ApplicationStatus.REJECTED
                || request.getStatus() == ApplicationStatus.SCREENING_REJECTED) {
            application.setRejectionReason(request.getRejectionReason());
        } else {
            application.setRejectionReason(null);
        }

        if (request.getInterviewDate() != null && !request.getInterviewDate().isEmpty()) {
            // [FIX A-05] Catch DateTimeParseException thay vì để HTTP 500
            try {
                application.setInterviewDate(java.time.LocalDateTime.parse(
                        request.getInterviewDate(), java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            } catch (java.time.format.DateTimeParseException e) {
                throw new AppException(ErrorCode.INVALID_PARAMETER_FORMAT);
            }
        }
        if (request.getInterviewLink() != null) {
            application.setInterviewLink(request.getInterviewLink());
        }
        application.setScreenedBy(currentUser);

        Application savedApp = repository.save(application);

        // BR-26: when this application is ACCEPTED (via Kanban direct-accept),
        // withdraw any other non-terminal applications of the same student in the
        // same semester so other enterprises don't waste time reviewing CVs and
        // scheduling interviews for a student who has already been placed.
        if (request.getStatus() == ApplicationStatus.ACCEPTED) {
            withdrawOtherApplicationsInSemester(savedApp, "ACCEPTED via Kanban");
        }

        // Cascade: when rejecting from INTERVIEW_SCHEDULED, cancel any active
        // interview so the student doesn't see a "scheduled" ghost interview.
        if (request.getStatus() == ApplicationStatus.REJECTED) {
            cancelActiveInterviewsForApplication(application.getApplicationId(),
                    request.getRejectionReason());
        }

        return mapToResponse(savedApp);
    }

    private void cancelActiveInterviewsForApplication(UUID applicationId, String reason) {
        List<Interview> interviews = interviewRepository.findByApplication_ApplicationId(applicationId);
        LocalDateTime now = LocalDateTime.now();
        for (Interview iv : interviews) {
            String s = iv.getStatus();
            if ("SCHEDULED".equalsIgnoreCase(s)
                    || "CONFIRMED".equalsIgnoreCase(s)
                    || "RESCHEDULED".equalsIgnoreCase(s)) {
                iv.setStatus("CANCELLED");
                String composedReason = "Application rejected: " + (reason == null ? "" : reason);
                if (iv.getCancelReason() == null || iv.getCancelReason().isBlank()) {
                    iv.setCancelReason(composedReason);
                }
                iv.setUpdatedAt(now);
            }
        }
        interviewRepository.saveAll(interviews);
    }

    /**
     * BR-26: Centralized helper that withdraws every other non-terminal application
     * of the same student in the same semester whenever a terminal "won" event
     * happens — i.e. the application is set to SCREENING_PASSED (selected for
     * interview) or ACCEPTED (passed interview / direct accept).
     *
     * <p>Behavior:
     * <ul>
     *   <li>Only operates on applications within the same semester as the trigger.</li>
     *   <li>Withdraws only non-terminal statuses: PENDING, SCREENING_PASSED,
     *       INTERVIEW_SCHEDULED.</li>
     *   <li>Skips the triggering application itself.</li>
     *   <li>Sends a notification to the student for each withdrawn application so
     *       they understand why their other applications disappeared.</li>
     * </ul>
     */
    public void withdrawOtherApplicationsInSemester(Application trigger, String triggerReason) {
        if (trigger == null
                || trigger.getStudent() == null
                || trigger.getJobPost() == null
                || trigger.getJobPost().getSemester() == null) {
            return;
        }
        UUID studentId = trigger.getStudent().getUserId();
        UUID semesterId = trigger.getJobPost().getSemester().getSemesterId();

        List<Application> otherApps = repository.findByStudent_UserId(studentId);
        LocalDateTime now = LocalDateTime.now();
        int withdrawn = 0;
        for (Application other : otherApps) {
            if (other.getApplicationId().equals(trigger.getApplicationId())) {
                continue;
            }
            if (other.getJobPost() == null
                    || other.getJobPost().getSemester() == null
                    || !semesterId.equals(other.getJobPost().getSemester().getSemesterId())) {
                continue;
            }
            ApplicationStatus s = other.getStatus();
            if (s != ApplicationStatus.PENDING
                    && s != ApplicationStatus.SCREENING_PASSED
                    && s != ApplicationStatus.INTERVIEW_SCHEDULED) {
                continue;
            }
            other.setStatus(ApplicationStatus.WITHDRAWN);
            other.setUpdatedAt(now);
            repository.save(other);
            notifyApplicationWithdrawn(other, trigger, triggerReason);
            withdrawn++;
        }
        if (withdrawn > 0) {
            log.info(
                    "[BR-26] Withdrew {} other application(s) for student={} semester={} (reason={})",
                    withdrawn,
                    studentId,
                    semesterId,
                    triggerReason);
        }
    }

    private void notifyApplicationWithdrawn(Application withdrawnApp, Application trigger, String reason) {
        try {
            String jobTitle =
                    withdrawnApp.getJobPost() != null && withdrawnApp.getJobPost().getTitle() != null
                            ? withdrawnApp.getJobPost().getTitle()
                            : "job post";
            String triggerJobTitle =
                    trigger != null
                            && trigger.getJobPost() != null
                            && trigger.getJobPost().getTitle() != null
                                    ? trigger.getJobPost().getTitle()
                                    : "another opportunity";
            Notification n = Notification.builder()
                    .recipient(withdrawnApp.getStudent())
                    .title("Đơn ứng tuyển đã được rút tự động")
                    .message(String.format(
                            "Đơn ứng tuyển \"%s\" của bạn đã được rút vì bạn đã được chọn cho \"%s\" (%s).",
                            jobTitle, triggerJobTitle, reason == null ? "BR-26" : reason))
                    .type("GENERAL")
                    .referenceEntity("Application")
                    .referenceId(withdrawnApp.getApplicationId())
                    .isRead(false)
                    .build();
            notificationService.save(n);
        } catch (Exception ex) {
            log.warn(
                    "[BR-26] Failed to notify student about withdrawn application {}: {}",
                    withdrawnApp.getApplicationId(),
                    ex.getMessage());
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("[DEBUG] getCurrentUser: email={}", email);
        User user = userRepository.findByEmail(email).orElseThrow(() -> {
            log.error("[DEBUG] User not found for email: {}", email);
            return new AppException(ErrorCode.USER_NOT_EXISTED);
        });
        log.info("[DEBUG] getCurrentUser: found userId={}", user.getUserId());
        return user;
    }

    @Override
    @Transactional
    public org.springframework.core.io.Resource downloadCv(UUID applicationId) {
        Application application =
                repository.findById(applicationId).orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        // BR-32: Enterprises can only download CVs of students who applied to their
        // active posts.
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

        String cvUrl = application.getCvFileUrl();
        if (cvUrl == null || cvUrl.isBlank()) {
            // 40.0.E1
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }

        // Handle external URLs (http/https)
        if (cvUrl.startsWith("http://") || cvUrl.startsWith("https://")) {
            try {
                org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(cvUrl);
                repository.incrementDownloadCount(applicationId);
                return resource;
            } catch (java.net.MalformedURLException e) {
                throw new AppException(ErrorCode.FILE_NOT_FOUND);
            }
        }

        // Convert /uploads/cv/xxx.pdf -> user.dir/uploads/cv/xxx.pdf
        java.nio.file.Path filePath =
                java.nio.file.Paths.get(System.getProperty("user.dir"), cvUrl.replace("/uploads/", "uploads/"));

        if (!java.nio.file.Files.exists(filePath)) {
            // 40.0.E1: file missing or removed by applicant
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }

        // POST-2: increment download counter
        repository.incrementDownloadCount(applicationId);

        return new org.springframework.core.io.FileSystemResource(filePath);
    }

    private ApplicationResponse mapToResponse(Application app) {
        log.info("[DEBUG] mapToResponse: appId={}, student={}", app.getApplicationId(), app.getStudent());
        try {
            ApplicationResponse res = mapper.toApplicationResponse(app);
            if (app.getStudent() != null) {
                log.info("[DEBUG] mapToResponse: student not null, fetching profile");
                var profile = studentProfileRepository.findByUser_UserId(
                        app.getStudent().getUserId());
                if (profile != null) {
                    res.setStudentCode(profile.getStudentCode());
                    log.info("[DEBUG] mapToResponse: set studentCode={}", profile.getStudentCode());
                }
            }
            return res;
        } catch (Exception e) {
            log.error("[DEBUG] mapToResponse failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public Resource bulkDownloadCv(List<UUID> applicationIds) {
        if (applicationIds == null || applicationIds.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_PARAMETER_FORMAT);
        }

        User currentUser = getCurrentUser();
        List<Application> applications = repository.findAllById(applicationIds);

        if (applications.isEmpty() || applications.size() != applicationIds.size()) {
            throw new AppException(ErrorCode.APPLICATION_NOT_FOUND);
        }

        // Validate ownership for ALL requested applications
        for (Application application : applications) {
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
        }

        try {
            Path zipPath = Files.createTempFile("bulk_cv_", ".zip");
            try (ZipOutputStream zos = new ZipOutputStream(new java.io.FileOutputStream(zipPath.toFile()))) {
                for (Application application : applications) {
                    String cvUrl = application.getCvFileUrl();
                    if (cvUrl == null || cvUrl.isBlank()) {
                        continue; // Skip applications without CV
                    }

                    InputStream is = null;
                    try {
                        if (cvUrl.startsWith("http://") || cvUrl.startsWith("https://")) {
                            is = new java.net.URL(cvUrl).openConnection().getInputStream();
                        } else {
                            Path filePath =
                                    Paths.get(System.getProperty("user.dir"), cvUrl.replace("/uploads/", "uploads/"));
                            if (Files.exists(filePath)) {
                                is = Files.newInputStream(filePath);
                            }
                        }

                        if (is != null) {
                            String studentName = application.getStudent() != null
                                    ? application.getStudent().getFullName()
                                    : "Unknown";
                            if (studentName == null || studentName.trim().isEmpty()) studentName = "Unknown";
                            String fileName = "CV_" + studentName.replaceAll("[^a-zA-Z0-9.-]", "_") + "_"
                                    + application.getApplicationId().toString().substring(0, 8) + ".pdf";
                            ZipEntry zipEntry = new ZipEntry(fileName);
                            zos.putNextEntry(zipEntry);

                            byte[] buffer = new byte[1024];
                            int len;
                            while ((len = is.read(buffer)) > 0) {
                                zos.write(buffer, 0, len);
                            }
                            zos.closeEntry();

                            // Increment download count
                            repository.incrementDownloadCount(application.getApplicationId());
                        }
                    } catch (Exception e) {
                        log.warn(
                                "Failed to process CV for application {}: {}",
                                application.getApplicationId(),
                                e.getMessage());
                    } finally {
                        if (is != null) {
                            try {
                                is.close();
                            } catch (java.io.IOException e) {
                                log.warn("Failed to close input stream: {}", e.getMessage());
                            }
                        }
                    }
                }
            }
            return new FileSystemResource(zipPath.toFile());
        } catch (IOException e) {
            log.error("Error creating zip file for bulk download", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
}
