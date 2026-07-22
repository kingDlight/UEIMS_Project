package com.ueims.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ueims.dto.request.WeeklyReportRequest;
import com.ueims.dto.response.TmWeeklyReportOverviewDTO;
import com.ueims.dto.response.WeeklyReportDTO;
import com.ueims.dto.response.WeeklyReportStatusDTO;
import com.ueims.dto.response.WeeklyReportStatusSummaryDTO;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.WeeklyReportRepository;
import com.ueims.service.NotificationService;
import com.ueims.service.PlagiarismDetectionService;
import com.ueims.service.WeeklyReportService;
import com.ueims.util.HtmlSanitizer;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WeeklyReportServiceImpl implements WeeklyReportService {
    WeeklyReportRepository repository;
    UserRepository userRepository;
    EligibleStudentRepository eligibleStudentRepository;
    EnterpriseAssignmentRepository enterpriseAssignmentRepository;
    SemesterRepository semesterRepository;
    NotificationService notificationService;
    PlagiarismDetectionService plagiarismService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<WeeklyReportDTO> findAllDtos() {
        return enrichDtos(repository.findAllWithAssignmentGraph());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<WeeklyReport> findAll() {
        return repository.findAll();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<WeeklyReport> findMyReports() {
        User currentUser = getCurrentUser();
        return repository.findByAssignment_Student_UserId(currentUser.getUserId());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<WeeklyReportDTO> findMyReportsDtos() {
        return enrichDtos(findMyReports());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<WeeklyReportDTO> findByEnterprise() {
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null) return List.of();
        List<WeeklyReport> reports = repository.findAllWithAssignmentGraph().stream()
                .filter(r -> r.getAssignment() != null
                        && r.getAssignment().getEnterprise() != null
                        && currentUser
                                .getEnterprise()
                                .getEnterpriseId()
                                .equals(r.getAssignment().getEnterprise().getEnterpriseId()))
                .toList();
        return enrichDtos(reports);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public WeeklyReport findById(UUID id) {
        WeeklyReport report = repository
                .findByIdWithAssignmentGraph(id)
                .orElseThrow(() -> new AppException(ErrorCode.FIELD_REQUIRED));

        User currentUser = getCurrentUser();
        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("SYSTEM_ADMIN")
                        || role.getRole().getRoleName().equals("ADMIN")
                        || role.getRole().getRoleName().equals("TRAINING_MANAGER"));
        if (isStaff) {
            return report;
        }

        // If it's an Enterprise user, check if they are the supervisor assigned to this
        // student
        if (currentUser.getEnterprise() != null) {
            // [FIX W-01] null-guard trước khi gọi chuỗi getEnterprise().getEnterpriseId()
            if (report.getAssignment() == null
                    || report.getAssignment().getEnterprise() == null
                    || !report.getAssignment()
                            .getEnterprise()
                            .getEnterpriseId()
                            .equals(currentUser.getEnterprise().getEnterpriseId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            return report;
        }

        // If it's a Student, check if they are the owner
        // [FIX W-02] null-guard trước khi gọi getStudent().getUserId()
        if (report.getAssignment() == null
                || report.getAssignment().getStudent() == null
                || !report.getAssignment().getStudent().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return report;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public WeeklyReportDTO findByIdDto(UUID id) {
        return enrichDto(findById(id));
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
        com.ueims.model.entity.EligibleStudent eligibleStudent = eligibleStudentRepository
                .findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), assignment.getSemester().getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE));

        // BR-54: Only Semester 6 students can submit weekly reports
        if (eligibleStudent.getCurrentSemester() == null || eligibleStudent.getCurrentSemester() != 6) {
            throw new AppException(ErrorCode.STUDENT_NOT_IN_SEMESTER_6);
        }

        // BR-52: Weekly Report Submission Window
        LocalDate startDate = assignment.getSemester().getStartDate();
        long currentWeek = ChronoUnit.WEEKS.between(startDate, LocalDate.now()) + 1;

        if (entity.getWeekNumber() != (int) currentWeek) {
            throw new AppException(ErrorCode.INVALID_WEEK_REPORT_SUBMISSION);
        }

        entity.setAssignment(assignment);
        entity.setStatus("SUBMITTED");
        entity.setSubmittedAt(LocalDateTime.now());
        WeeklyReport saved = repository.save(entity);
        // BR-58: run plagiarism check asynchronously after submission
        try {
            double maxScore = plagiarismService.computeMaxSimilarity(saved);
            saved.setPlagiarismScore(maxScore);
            saved.setIsAnomaly(maxScore >= 0.85);
            if (Boolean.TRUE.equals(saved.getIsAnomaly())) {
                log.info("[BR-58] Weekly report {} flagged as ANOMALY (score={})", saved.getReportId(), maxScore);
            }
            repository.save(saved);
        } catch (Exception ex) {
            log.warn("[BR-58] Plagiarism check failed: {}", ex.getMessage());
        }
        return saved;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public WeeklyReportDTO saveAndEnrich(WeeklyReport entity) {
        return enrichDto(save(entity));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public WeeklyReport updateReport(UUID id, WeeklyReportRequest request) {
        WeeklyReport existing = repository
                .findByIdWithAssignmentGraph(id)
                .orElseThrow(() -> new AppException(ErrorCode.FIELD_REQUIRED));

        User currentUser = getCurrentUser();
        if (!currentUser
                .getUserId()
                .equals(existing.getAssignment().getStudent().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-53: Weekly Report Edit Constraint (Only allow editing if DRAFT or REJECTED)
        String status = existing.getStatus();
        if ("APPROVED".equals(status) || "SUBMITTED".equals(status)) {
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
    public WeeklyReportDTO updateReportAndEnrich(UUID id, WeeklyReportRequest request) {
        return enrichDto(updateReport(id, request));
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
                        || role.getRole().getRoleName().equals("ADMIN")
                        || role.getRole().getRoleName().equals("TRAINING_MANAGER"));
        if (!isStaff && !report.getAssignment().getStudent().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        repository.deleteById(id);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public WeeklyReport approveReport(UUID id, String feedback) {
        WeeklyReport existing = repository
                .findByIdWithAssignmentGraph(id)
                .orElseThrow(() -> new AppException(ErrorCode.FIELD_REQUIRED));
        User currentUser = getCurrentUser();

        // BR-29: ownership — enterprise must own the assignment
        if (currentUser.getEnterprise() == null
                || existing.getAssignment() == null
                || existing.getAssignment().getEnterprise() == null
                || !currentUser
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(existing.getAssignment().getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        existing.setStatus("APPROVED");
        if (feedback != null) existing.setFeedback(feedback);
        WeeklyReport saved = repository.save(existing);
        try {
            notificationService.notifyWeeklyReportApproved(saved);
        } catch (Exception ex) {
            log.warn("[UC-48] Approved notification failed: {}", ex.getMessage());
        }
        return saved;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public WeeklyReportDTO approveReportAndEnrich(UUID id, String feedback) {
        return enrichDto(approveReport(id, feedback));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public WeeklyReport rejectReport(UUID id, String feedback) {
        WeeklyReport existing = repository
                .findByIdWithAssignmentGraph(id)
                .orElseThrow(() -> new AppException(ErrorCode.FIELD_REQUIRED));
        User currentUser = getCurrentUser();

        if (currentUser.getEnterprise() == null
                || existing.getAssignment() == null
                || existing.getAssignment().getEnterprise() == null
                || !currentUser
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(existing.getAssignment().getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-40: feedback is mandatory on rejection
        if (feedback == null || feedback.isBlank()) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }

        existing.setStatus("REJECTED");
        existing.setFeedback(feedback);
        WeeklyReport saved = repository.save(existing);
        try {
            notificationService.notifyWeeklyReportRejected(saved, feedback);
        } catch (Exception ex) {
            log.warn("[UC-48] Reject notification failed: {}", ex.getMessage());
        }
        return saved;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public WeeklyReportDTO rejectReportAndEnrich(UUID id, String feedback) {
        return enrichDto(rejectReport(id, feedback));
    }

    /**
     * FIX 006-C: BR-56 — Training Manager đánh dấu một weekly report nộp trễ
     * là được chấp nhận (grace period). Set late_override_by = currentUser.id
     * và append lý do vào feedback.
     *
     * Chỉ áp dụng khi báo cáo đã ở trạng thái SUBMITTED/APPROVED/REJECTED và
     * đã bị submission window trigger từ chối trước đó (hoặc admin/TM muốn đánh
     * dấu thủ công).
     *
     * Lưu ý: BR-56 trigger nằm trên INSERT, vì vậy method này dùng để đánh dấu
     * AFTER-SUBMISSION (cập nhật submitted). Nếu report đang ở status NOT_SUBMITTED,
     * ta set late_override_by để nếu student submit sau với cùng week_number, trigger
     * sẽ cho phép pass.
     */
    @Override
    @org.springframework.transaction.annotation.Transactional
    public WeeklyReport overrideLateSubmission(UUID id, String reason) {
        WeeklyReport existing = repository
                .findByIdWithAssignmentGraph(id)
                .orElseThrow(() -> new AppException(ErrorCode.FIELD_REQUIRED));

        User currentUser = getCurrentUser();

        // Đã override rồi → không cho override lại (idempotent)
        if (existing.getLateOverrideBy() != null) {
            throw new AppException(ErrorCode.RESOURCE_INVALID_STATE);
        }

        // Verify người hiện tại là TM/Admin/SYSTEM_ADMIN
        boolean isStaff = currentUser.getRoles().stream().anyMatch(role -> {
            String rn = role.getRole().getRoleName();
            return rn.equals("TRAINING_MANAGER") || rn.equals("ADMIN") || rn.equals("SYSTEM_ADMIN");
        });
        if (!isStaff) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (reason == null || reason.isBlank() || reason.length() < 10) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }

        existing.setLateOverrideBy(currentUser.getUserId());

        // Append reason vào feedback (nếu chưa có)
        String prefix = "[TM OVERRIDE] " + reason.trim();
        if (existing.getFeedback() == null || existing.getFeedback().isBlank()) {
            existing.setFeedback(prefix);
        } else {
            existing.setFeedback(prefix + "\n---\n" + existing.getFeedback());
        }

        return repository.save(existing);
    }

    @Override
    public WeeklyReportDTO overrideLateAndEnrich(UUID id, String reason) {
        return enrichDto(overrideLateSubmission(id, reason));
    }

    /**
     * Populate student + enterprise info, plus the materialized week range
     * derived from semester.startDate and report.weekNumber.
     *
     * Fallback for studentCode: if no EligibleStudent record exists for this
     * user/semester, leave the field null so the FE can show "N/A".
     *
     * Week math: week N starts at semester.startDate + (N-1)*7 days and ends
     * +6 days. Both bounds are inclusive.
     */
    public List<WeeklyReportDTO> enrichDtos(List<WeeklyReport> reports) {
        return reports.stream().map(this::enrichDto).toList();
    }

    public WeeklyReportDTO enrichDto(WeeklyReport report) {
        WeeklyReportDTO.WeeklyReportDTOBuilder dto = WeeklyReportDTO.builder()
                .reportId(report.getReportId())
                .weekNumber(report.getWeekNumber())
                .tasksCompleted(report.getTasksCompleted())
                .issuesChallenges(report.getIssuesChallenges())
                .lessonsLearned(report.getLessonsLearned())
                .planNextWeek(report.getPlanNextWeek())
                .attachmentUrls(report.getAttachmentUrls())
                .status(report.getStatus())
                .feedback(report.getFeedback())
                .submittedAt(report.getSubmittedAt())
                .plagiarismScore(report.getPlagiarismScore())
                .isAnomaly(report.getIsAnomaly())
                .hoursLogged(report.getHoursLogged())
                .lateOverrideBy(report.getLateOverrideBy());

        if (report.getAssignment() != null) {
            dto.assignmentId(report.getAssignment().getAssignmentId());

            if (report.getAssignment().getStudent() != null) {
                User student = report.getAssignment().getStudent();
                dto.studentName(student.getFullName());
                dto.studentEmail(student.getEmail());
            }

            if (report.getAssignment().getEnterprise() != null) {
                dto.enterpriseName(report.getAssignment().getEnterprise().getCompanyName());
            }

            // Derive weekStartDate / weekEndDate from semester.startDate + weekNumber.
            // Only compute when both semester and weekNumber are present.
            if (report.getAssignment().getSemester() != null
                    && report.getAssignment().getSemester().getStartDate() != null
                    && report.getWeekNumber() != null
                    && report.getWeekNumber() > 0) {
                java.time.LocalDate start = report.getAssignment()
                        .getSemester()
                        .getStartDate()
                        .plusDays((long) (report.getWeekNumber() - 1) * 7);
                dto.weekStartDate(start);
                dto.weekEndDate(start.plusDays(6));
            }

            // Try to get student code from EligibleStudent table.
            if (report.getAssignment().getStudent() != null
                    && report.getAssignment().getSemester() != null) {
                eligibleStudentRepository
                        .findByUser_UserIdAndSemester_SemesterId(
                                report.getAssignment().getStudent().getUserId(),
                                report.getAssignment().getSemester().getSemesterId())
                        .ifPresent(eligible -> dto.studentCode(eligible.getStudentCode()));
            }
        }

        return dto.build();
    }

    /**
     * Tính toán trạng thái weekly report của SV hiện tại:
     * - Lấy assignment ACTIVE của SV (mỗi SV chỉ có 1 assignment ACTIVE / kỳ).
     * - Tính tuần hiện tại theo semester.startDate và CURRENT_DATE.
     * - Tổng số tuần = floor((semester.endDate - startDate) / 7) + 1.
     * - Với mỗi tuần đã qua (deadline < today), nếu chưa có report → status = MISSED, isOverdue=true.
     * - Tuần hiện tại → deadline là CN sắp tới (tính theo ngày trong tuần).
     * - Tuần tương lai → status = NOT_SUBMITTED nhưng isOverdue=false.
     *
     * Logic warning dashboard:
     *   overdueCount > 0  → bật cờ cảnh báo "Bạn đã bỏ lỡ N tuần báo cáo"
     *   pendingThisWeek > 0 → bật cờ "Tuần N sắp hết hạn"
     */
    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public WeeklyReportStatusSummaryDTO getMyWeeklyReportStatusSummary() {
        User currentUser = getCurrentUser();

        // Tìm assignment ACTIVE của SV
        List<EnterpriseAssignment> assignments =
                enterpriseAssignmentRepository.findByStudent_UserIdAndStatus(currentUser.getUserId(), "ACTIVE");

        if (assignments.isEmpty()) {
            return new WeeklyReportStatusSummaryDTO(null, 0, 0, 0, 0, 0, 0, List.of());
        }

        EnterpriseAssignment assignment = assignments.get(0);
        Semester semester = assignment.getSemester();

        if (semester == null || semester.getStartDate() == null || semester.getEndDate() == null) {
            return new WeeklyReportStatusSummaryDTO(null, 0, 0, 0, 0, 0, 0, List.of());
        }

        // Tính tổng số tuần
        long days = ChronoUnit.DAYS.between(semester.getStartDate(), semester.getEndDate());
        int totalWeeks = (int) (days / 7) + 1;

        // Tính tuần hiện tại
        LocalDate today = LocalDate.now();
        LocalDate semesterStart = semester.getStartDate();
        int currentWeek;
        if (today.isBefore(semesterStart)) {
            currentWeek = 0; // chưa bắt đầu kỳ
        } else {
            long elapsedDays = ChronoUnit.DAYS.between(semesterStart, today);
            currentWeek = (int) (elapsedDays / 7) + 1;
            if (currentWeek > totalWeeks) currentWeek = totalWeeks;
        }

        // Lấy tất cả reports của assignment này, group theo week_number
        List<WeeklyReport> myReports = repository.findByAssignment_AssignmentId(assignment.getAssignmentId());
        Map<Integer, WeeklyReport> byWeek = new HashMap<>();
        for (WeeklyReport r : myReports) {
            byWeek.put(r.getWeekNumber(), r);
        }

        // Build danh sách tuần
        List<WeeklyReportStatusDTO> weeks = new ArrayList<>();
        int submittedCount = 0;
        int approvedCount = 0;
        int overdueCount = 0;
        int pendingThisWeek = 0;

        for (int w = 1; w <= totalWeeks; w++) {
            LocalDate deadline = semesterStart.plusDays((long) (w - 1) * 7L);
            // deadline luôn là CN của tuần đó (semester bắt đầu bằng CN trong hệ thống này)

            WeeklyReport existing = byWeek.get(w);
            String status;
            String reportId = null;
            boolean isPast = today.isAfter(deadline);
            boolean isOverdue = false;
            Long daysLate = null;

            if (existing != null) {
                status = existing.getStatus();
                reportId = existing.getReportId() == null
                        ? null
                        : existing.getReportId().toString();

                if ("SUBMITTED".equals(status) || "APPROVED".equals(status) || "REJECTED".equals(status)) {
                    submittedCount++;
                }
                if ("APPROVED".equals(status)) {
                    approvedCount++;
                }
            } else {
                if (isPast) {
                    status = "MISSED";
                    isOverdue = true;
                    overdueCount++;
                    daysLate = ChronoUnit.DAYS.between(deadline, today);
                } else {
                    status = "NOT_SUBMITTED";
                    if (w == currentWeek) {
                        pendingThisWeek = 1;
                    }
                }
            }

            weeks.add(new WeeklyReportStatusDTO(w, status, deadline, isOverdue, isPast, daysLate, reportId));
        }

        return new WeeklyReportStatusSummaryDTO(
                semester.getSemesterCode(),
                totalWeeks,
                currentWeek,
                submittedCount,
                approvedCount,
                overdueCount,
                pendingThisWeek,
                weeks);
    }

    /**
     * FIX 006-A: Tổng hợp toàn kỳ cho Training Manager.
     *
     * Nếu semesterId null → lấy semester ACTIVE.
     * Trả về:
     * - Week distribution: tỷ lệ submit / overdue theo từng tuần
     * - Overdue students: SV có ít nhất 1 tuần MISSED + email để nhắc
     * - Anomaly reports: report bị plagiarism_score cao (BR-58)
     */
    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public TmWeeklyReportOverviewDTO getTmOverview(java.util.UUID semesterId) {
        // Resolve semester
        Semester semester;
        if (semesterId != null) {
            semester = semesterRepository
                    .findById(semesterId)
                    .orElseThrow(() -> new AppException(ErrorCode.FIELD_REQUIRED));
        } else {
            List<Semester> actives = semesterRepository.findByStatus("ACTIVE");
            if (actives.isEmpty()) {
                return new TmWeeklyReportOverviewDTO(null, 0, 0, 0, 0, 0, 0, List.of(), List.of(), List.of());
            }
            semester = actives.get(0);
        }

        LocalDate semesterStart = semester.getStartDate();
        LocalDate semesterEnd = semester.getEndDate();
        if (semesterStart == null || semesterEnd == null) {
            return new TmWeeklyReportOverviewDTO(
                    semester.getSemesterCode(), 0, 0, 0, 0, 0, 0, List.of(), List.of(), List.of());
        }

        long days = ChronoUnit.DAYS.between(semesterStart, semesterEnd);
        int totalWeeks = (int) (days / 7) + 1;

        LocalDate today = LocalDate.now();
        int currentWeek;
        if (today.isBefore(semesterStart)) {
            currentWeek = 0;
        } else {
            long elapsed = ChronoUnit.DAYS.between(semesterStart, today);
            currentWeek = (int) (elapsed / 7) + 1;
            if (currentWeek > totalWeeks) currentWeek = totalWeeks;
        }

        // Lấy tất cả ACTIVE assignment trong kỳ này
        List<EnterpriseAssignment> assignments =
                enterpriseAssignmentRepository.findBySemester_SemesterIdAndStatus(semester.getSemesterId(), "ACTIVE");
        int totalStudents = assignments.size();

        // Lấy tất cả reports của kỳ
        List<WeeklyReport> allReports = repository.findAllBySemesterIdWithGraph(semester.getSemesterId());

        // Index reports theo (assignmentId, weekNumber)
        Map<java.util.UUID, Map<Integer, WeeklyReport>> reportsByAssignmentWeek = new HashMap<>();
        int totalSubmitted = 0;
        for (WeeklyReport r : allReports) {
            if (r.getAssignment() == null) continue;
            reportsByAssignmentWeek
                    .computeIfAbsent(r.getAssignment().getAssignmentId(), k -> new HashMap<>())
                    .put(r.getWeekNumber(), r);
            String st = r.getStatus();
            if ("SUBMITTED".equals(st) || "APPROVED".equals(st) || "REJECTED".equals(st)) {
                totalSubmitted++;
            }
        }

        // === Week distribution ===
        List<TmWeeklyReportOverviewDTO.WeekDistribution> weekDistribution = new ArrayList<>();
        Map<Integer, Integer> submittedPerWeek = new HashMap<>();
        Map<Integer, Integer> lateOverridePerWeek = new HashMap<>();
        for (WeeklyReport r : allReports) {
            String st = r.getStatus();
            if ("SUBMITTED".equals(st) || "APPROVED".equals(st) || "REJECTED".equals(st)) {
                submittedPerWeek.merge(r.getWeekNumber(), 1, Integer::sum);
            }
            if (r.getLateOverrideBy() != null) {
                lateOverridePerWeek.merge(r.getWeekNumber(), 1, Integer::sum);
            }
        }

        for (int w = 1; w <= totalWeeks; w++) {
            LocalDate deadline = semesterStart.plusDays((long) (w - 1) * 7L);
            int overdueCount = 0;
            int submitted = submittedPerWeek.getOrDefault(w, 0);
            if (today.isAfter(deadline)) {
                // overdue = ACTIVE SV chưa submit tuần này (chưa có report với status SUBMITTED/APPROVED/REJECTED)
                for (EnterpriseAssignment a : assignments) {
                    Map<Integer, WeeklyReport> studentReports = reportsByAssignmentWeek.get(a.getAssignmentId());
                    boolean hasSubmitted = false;
                    if (studentReports != null) {
                        WeeklyReport rep = studentReports.get(w);
                        if (rep != null) {
                            String st = rep.getStatus();
                            if ("SUBMITTED".equals(st) || "APPROVED".equals(st) || "REJECTED".equals(st)) {
                                hasSubmitted = true;
                            }
                        }
                    }
                    if (!hasSubmitted) overdueCount++;
                }
            }
            weekDistribution.add(new TmWeeklyReportOverviewDTO.WeekDistribution(
                    w, deadline, submitted, overdueCount, lateOverridePerWeek.getOrDefault(w, 0)));
        }

        // === Overdue students ===
        // Cache studentCode by (userId, semesterId)
        Map<java.util.UUID, EligibleStudent> eligibleByUserSemester = new HashMap<>();
        for (EligibleStudent es : eligibleStudentRepository.findBySemester_SemesterId(semester.getSemesterId())) {
            eligibleByUserSemester.put(es.getUser().getUserId(), es);
        }

        List<TmWeeklyReportOverviewDTO.OverdueStudentRow> overdueStudents = new ArrayList<>();
        int totalOverdueStudents = 0;

        for (EnterpriseAssignment a : assignments) {
            Map<Integer, WeeklyReport> studentReports = reportsByAssignmentWeek.get(a.getAssignmentId());
            List<Integer> missedWeeks = new ArrayList<>();
            for (int w = 1; w <= totalWeeks; w++) {
                LocalDate deadline = semesterStart.plusDays((long) (w - 1) * 7L);
                if (today.isAfter(deadline)) {
                    boolean hasSubmitted = false;
                    if (studentReports != null) {
                        WeeklyReport rep = studentReports.get(w);
                        if (rep != null) {
                            String st = rep.getStatus();
                            if ("SUBMITTED".equals(st)
                                    || "APPROVED".equals(st)
                                    || "REJECTED".equals(st)
                                    || rep.getLateOverrideBy() != null) {
                                hasSubmitted = true;
                            }
                        }
                    }
                    if (!hasSubmitted) missedWeeks.add(w);
                }
            }
            if (!missedWeeks.isEmpty()) {
                totalOverdueStudents++;
                User stu = a.getStudent();
                String code = "N/A";
                if (stu != null && eligibleByUserSemester.containsKey(stu.getUserId())) {
                    code = eligibleByUserSemester.get(stu.getUserId()).getStudentCode();
                }
                overdueStudents.add(new TmWeeklyReportOverviewDTO.OverdueStudentRow(
                        stu == null ? null : stu.getUserId().toString(),
                        code,
                        stu == null ? "" : stu.getFullName(),
                        a.getEnterprise() == null ? "" : a.getEnterprise().getCompanyName(),
                        missedWeeks,
                        missedWeeks.size(),
                        stu == null ? null : stu.getEmail()));
            }
        }

        // === Anomaly reports ===
        List<WeeklyReport> anomalies = repository.findAnomaliesBySemesterId(semester.getSemesterId());
        int totalAnomalies = anomalies.size();
        List<TmWeeklyReportOverviewDTO.AnomalyReportRow> anomalyRows = new ArrayList<>();
        for (WeeklyReport r : anomalies) {
            String code = "N/A";
            if (r.getAssignment() != null
                    && r.getAssignment().getStudent() != null
                    && eligibleByUserSemester.containsKey(
                            r.getAssignment().getStudent().getUserId())) {
                code = eligibleByUserSemester
                        .get(r.getAssignment().getStudent().getUserId())
                        .getStudentCode();
            }
            anomalyRows.add(new TmWeeklyReportOverviewDTO.AnomalyReportRow(
                    r.getReportId() == null ? null : r.getReportId().toString(),
                    code,
                    r.getAssignment() == null || r.getAssignment().getStudent() == null
                            ? ""
                            : r.getAssignment().getStudent().getFullName(),
                    r.getAssignment() == null || r.getAssignment().getEnterprise() == null
                            ? ""
                            : r.getAssignment().getEnterprise().getCompanyName(),
                    r.getWeekNumber(),
                    r.getPlagiarismScore(),
                    r.getSubmittedAt()));
        }

        return new TmWeeklyReportOverviewDTO(
                semester.getSemesterCode(),
                totalStudents,
                currentWeek,
                totalWeeks,
                totalSubmitted,
                totalAnomalies,
                totalOverdueStudents,
                weekDistribution,
                overdueStudents,
                anomalyRows);
    }
}
