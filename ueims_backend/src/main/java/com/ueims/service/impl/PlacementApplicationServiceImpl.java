package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.ManualMatchRequest;
import com.ueims.dto.request.PlacementApplicationRequest;
import com.ueims.dto.request.RejectApplicationRequest;
import com.ueims.dto.response.AutoMatchResultDTO;
import com.ueims.dto.response.OjtPlacementViewDTO;
import com.ueims.dto.response.PlacementApplicationResponseDTO;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.mapper.PlacementApplicationMapper;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.PlacementApplication;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.PlacementApplicationRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.EnterpriseAssignmentService;
import com.ueims.service.PlacementApplicationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PlacementApplicationServiceImpl implements PlacementApplicationService {

    /**
     * Auto-match threshold: SV có GPA (thang 10) dưới mức này sẽ KHÔNG được auto-match.
     * GPA trong DB lưu thang 10 (0.00 – 10.00). Threshold 7.0/10.
     */
    static final double AUTO_MATCH_GPA_THRESHOLD = 7.0; // thang 10

    /** Auto-match scoring weights. */
    static final int SCORE_MAJOR_MATCH = 50;

    static final int SCORE_GPA_MAX = 40; // GPA 10.0 / 10 * 40 = 40
    static final int SCORE_RANDOM_MAX = 10; // tie-breaker

    PlacementApplicationRepository applicationRepository;
    EnterpriseAssignmentRepository assignmentRepository;
    EligibleStudentRepository eligibleRepository;
    EnterpriseRepository enterpriseRepository;
    SemesterRepository semesterRepository;
    UserRepository userRepository;
    EnterpriseAssignmentService enterpriseAssignmentService;
    PlacementApplicationMapper mapper;

    @Override
    @Transactional
    public PlacementApplicationResponseDTO apply(UUID studentId, PlacementApplicationRequest request) {
        User student =
                userRepository.findById(studentId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Enterprise enterprise = enterpriseRepository
                .findById(request.getEnterpriseId())
                .orElseThrow(() -> new AppException(ErrorCode.ENTERPRISE_NOT_FOUND));

        if (!"APPROVED".equals(enterprise.getStatus())) {
            throw new AppException(ErrorCode.ENTERPRISE_NOT_APPROVED);
        }

        Semester semester = getActiveOrOpenSemester();

        // Check SV có trong eligible_students với status phù hợp không
        EligibleStudent eligible = eligibleRepository
                .findByUser_UserIdAndSemester_SemesterId(studentId, semester.getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE_FOR_PLACEMENT));

        if (!List.of("ACCEPTED", "MATCHED", "OJT").contains(eligible.getStatus())) {
            throw new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE_FOR_PLACEMENT);
        }

        // ── Self-Replace check ──────────────────────────────────────
        // Nếu SV đã có assignment ACTIVE trong kỳ → đây là replacement request
        Optional<EnterpriseAssignment> activeAssignment =
                assignmentRepository.findByStudent_UserIdAndSemester_Status(studentId, "ACTIVE");

        boolean isReplacement = activeAssignment.isPresent();

        if (isReplacement) {
            // Block: cùng DN với assignment hiện tại
            EnterpriseAssignment current = activeAssignment.get();
            if (current.getEnterprise().getEnterpriseId().equals(enterprise.getEnterpriseId())) {
                throw new AppException(ErrorCode.SAME_ENTERPRISE_REPLACEMENT_BLOCKED);
            }
        } else {
            // Block: SV đã có assignment ACTIVE (giữ logic cũ)
            if (applicationRepository.existsActiveAssignmentForStudentInSemester(studentId, semester.getSemesterId())) {
                throw new AppException(ErrorCode.STUDENT_HAS_ACTIVE_PLACEMENT);
            }
        }

        // Check duplicate application (cùng SV + DN + kỳ)
        Optional<PlacementApplication> existing =
                applicationRepository.findByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
                        studentId, enterprise.getEnterpriseId(), semester.getSemesterId());
        if (existing.isPresent()) {
            PlacementApplication app = existing.get();
            if ("PENDING_APPROVAL".equals(app.getStatus())) {
                throw new AppException(ErrorCode.DUPLICATE_PLACEMENT_APPLICATION);
            }
            if ("APPROVED".equals(app.getStatus())) {
                throw new AppException(ErrorCode.STUDENT_HAS_ACTIVE_PLACEMENT);
            }
        }

        PlacementApplication.PlacementApplicationBuilder builder = PlacementApplication.builder()
                .student(student)
                .enterprise(enterprise)
                .semester(semester)
                .status("PENDING_APPROVAL")
                .coverLetter(request.getCoverLetter())
                .isReplacement(isReplacement);

        // Nếu là replacement: link tới application APPROVED trước đó
        if (isReplacement) {
            applicationRepository
                    .findByStudent_UserIdAndEnterprise_EnterpriseIdAndStatus(
                            studentId, activeAssignment.get().getEnterprise().getEnterpriseId(), "APPROVED")
                    .ifPresent(builder::replacesApplication);
        }

        PlacementApplication app = builder.build();
        PlacementApplication saved = applicationRepository.save(app);

        if (isReplacement) {
            log.info(
                    "Student {} submitted REPLACEMENT request to enterprise {} (current: {})",
                    studentId,
                    enterprise.getEnterpriseId(),
                    activeAssignment.get().getEnterprise().getCompanyName());
        } else {
            log.info(
                    "Student {} applied to enterprise {} for semester {}",
                    studentId,
                    enterprise.getEnterpriseId(),
                    semester.getSemesterId());
        }
        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public PlacementApplicationResponseDTO approve(UUID applicationId, UUID reviewerId) {
        PlacementApplication app = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.PLACEMENT_APP_NOT_FOUND));

        if (!"PENDING_APPROVAL".equals(app.getStatus())) {
            throw new AppException(ErrorCode.PLACEMENT_APP_NOT_PENDING);
        }

        // Check xem SV đã có ACTIVE assignment cho kỳ này chưa
        if (applicationRepository.existsActiveAssignmentForStudentInSemester(
                app.getStudent().getUserId(), app.getSemester().getSemesterId())) {
            throw new AppException(ErrorCode.STUDENT_HAS_ACTIVE_PLACEMENT);
        }

        User reviewer =
                userRepository.findById(reviewerId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Auto-create EnterpriseAssignment (BR-11: không cho nếu semester LOCKED)
        if ("LOCKED".equals(app.getSemester().getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_LOCKED_DATE);
        }

        // ── Self-Replace: terminate assignment cũ + tạo cái mới ──────
        EnterpriseAssignment oldAssignment = null;
        if (Boolean.TRUE.equals(app.getIsReplacement())) {
            oldAssignment = assignmentRepository
                    .findByStudent_UserIdAndSemester_Status(app.getStudent().getUserId(), "ACTIVE")
                    .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
        }

        EnterpriseAssignment newAssignment = EnterpriseAssignment.builder()
                .enterprise(app.getEnterprise())
                .student(app.getStudent())
                .semester(app.getSemester())
                .status("ACTIVE")
                .assignedBy(reviewer)
                .build();
        newAssignment = assignmentRepository.save(newAssignment);

        // Auto-complete assignment ACTIVE cũ ở kỳ khác (SV đã lên kỳ mới)
        int completed = enterpriseAssignmentService.autoCompletePriorActiveAssignments(
                app.getStudent().getUserId(), app.getSemester().getSemesterId());
        if (completed > 0) {
            log.info("[AUTO-COMPLETE] Prior assignments auto-completed before replacement link: {}", completed);
        }

        // Link assignment cũ → mới (nếu là replacement)
        if (oldAssignment != null) {
            oldAssignment.setStatus("TERMINATED");
            oldAssignment.setTerminationReason("Replaced by new placement");
            oldAssignment.setTerminatedAt(LocalDateTime.now());
            oldAssignment.setReplacedByAssignment(newAssignment);
            assignmentRepository.save(oldAssignment);
            log.info(
                    "Old assignment {} TERMINATED, replaced by new assignment {}",
                    oldAssignment.getAssignmentId(),
                    newAssignment.getAssignmentId());
        }

        // Update application status
        app.setStatus("APPROVED");
        app.setReviewedBy(reviewer);
        app.setReviewedAt(LocalDateTime.now());

        PlacementApplication saved = applicationRepository.save(app);
        log.info(
                "Application {} approved by {} → assignment {} created{}",
                applicationId,
                reviewerId,
                newAssignment.getAssignmentId(),
                oldAssignment != null ? " (replacement)" : "");
        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public PlacementApplicationResponseDTO reject(
            UUID applicationId, UUID reviewerId, RejectApplicationRequest request) {
        PlacementApplication app = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.PLACEMENT_APP_NOT_FOUND));

        if (!"PENDING_APPROVAL".equals(app.getStatus())) {
            throw new AppException(ErrorCode.PLACEMENT_APP_NOT_PENDING);
        }

        if (request.getRejectionReason() == null
                || request.getRejectionReason().trim().length() < 5) {
            throw new AppException(ErrorCode.REJECTION_REASON_REQUIRED);
        }

        User reviewer =
                userRepository.findById(reviewerId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        app.setStatus("REJECTED");
        app.setRejectionReason(request.getRejectionReason().trim());
        app.setReviewedBy(reviewer);
        app.setReviewedAt(LocalDateTime.now());

        PlacementApplication saved = applicationRepository.save(app);

        // Nếu reject 1 replacement request: assignment cũ giữ nguyên ACTIVE
        if (Boolean.TRUE.equals(app.getIsReplacement())) {
            log.info("Replacement request {} rejected — old assignment remains ACTIVE", applicationId);
        }
        log.info("Application {} rejected by {}: {}", applicationId, reviewerId, request.getRejectionReason());
        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public PlacementApplicationResponseDTO withdraw(UUID applicationId, UUID studentId) {
        PlacementApplication app = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.PLACEMENT_APP_NOT_FOUND));

        if (!app.getStudent().getUserId().equals(studentId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!"PENDING_APPROVAL".equals(app.getStatus())) {
            throw new AppException(ErrorCode.PLACEMENT_APP_NOT_PENDING);
        }

        app.setStatus("WITHDRAWN");
        PlacementApplication saved = applicationRepository.save(app);

        // Nếu withdraw 1 replacement request: assignment cũ giữ nguyên ACTIVE
        if (Boolean.TRUE.equals(app.getIsReplacement())) {
            log.info("Replacement request {} withdrawn by student — old assignment remains ACTIVE", applicationId);
        }
        log.info("Application {} withdrawn by student {}", applicationId, studentId);
        return mapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlacementApplicationResponseDTO> getPending() {
        return applicationRepository.findByStatusOrderByCreatedAtDesc("PENDING_APPROVAL").stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlacementApplicationResponseDTO> getMyApplications(UUID studentId) {
        return applicationRepository.findByStudent_UserIdOrderByCreatedAtDesc(studentId).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<OjtPlacementViewDTO> getOjtPlacementView() {
        List<Object[]> rows = applicationRepository.findOjtPlacementView();
        List<OjtPlacementViewDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            OjtPlacementViewDTO.OjtPlacementViewDTOBuilder builder = OjtPlacementViewDTO.builder()
                    .studentId(toUuid(row[0]))
                    .studentName((String) row[1])
                    .studentCode((String) row[2])
                    .major((String) row[3])
                    .semesterId(toUuid(row[4]))
                    .semesterCode((String) row[5])
                    .workflowStatus((String) row[6])
                    .assignmentId(toUuid(row[7]))
                    .enterpriseId(toUuid(row[8]))
                    .enterpriseName((String) row[9])
                    .applicationId(toUuid(row[10]))
                    .applicationStatus((String) row[11])
                    .coverLetter((String) row[12])
                    .isReplacement(toBoolean(row[13]))
                    .deferredReason((String) row[14])
                    .deferredByName((String) row[15])
                    .deferredAt(toLocalDateTime(row[16]));
            result.add(builder.build());
        }
        return result;
    }

    private Boolean toBoolean(Object o) {
        if (o == null) return false;
        if (o instanceof Boolean b) return b;
        if (o instanceof Number n) return n.intValue() != 0;
        return Boolean.parseBoolean(o.toString());
    }

    private LocalDateTime toLocalDateTime(Object o) {
        if (o == null) return null;
        if (o instanceof LocalDateTime ldt) return ldt;
        if (o instanceof java.sql.Timestamp ts) return ts.toLocalDateTime();
        return LocalDateTime.parse(o.toString());
    }

    @Override
    @Transactional
    public PlacementApplicationResponseDTO manualMatch(UUID reviewerId, ManualMatchRequest request) {
        User student = userRepository
                .findById(request.getStudentId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Enterprise enterprise = enterpriseRepository
                .findById(request.getEnterpriseId())
                .orElseThrow(() -> new AppException(ErrorCode.ENTERPRISE_NOT_FOUND));

        if (!"APPROVED".equals(enterprise.getStatus())) {
            throw new AppException(ErrorCode.ENTERPRISE_NOT_APPROVED);
        }

        Semester semester = getActiveOrOpenSemester();

        // Check SV có trong eligible_students
        EligibleStudent eligible = eligibleRepository
                .findByUser_UserIdAndSemester_SemesterId(student.getUserId(), semester.getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE_FOR_PLACEMENT));

        if (!List.of("ACCEPTED", "MATCHED", "OJT").contains(eligible.getStatus())) {
            throw new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE_FOR_PLACEMENT);
        }

        // Manual match CHỈ dành cho SV UNPLACED (không có assignment ACTIVE + không có application pending)
        if (applicationRepository.existsActiveAssignmentForStudentInSemester(
                student.getUserId(), semester.getSemesterId())) {
            throw new AppException(ErrorCode.STUDENT_HAS_ACTIVE_PLACEMENT);
        }
        boolean hasPending =
                !applicationRepository.findByStatusAndSemester("PENDING_APPROVAL", semester.getSemesterId()).stream()
                        .filter(a -> a.getStudent().getUserId().equals(student.getUserId()))
                        .toList()
                        .isEmpty();
        if (hasPending) {
            throw new AppException(ErrorCode.STUDENT_NOT_UNPLACED);
        }

        if ("LOCKED".equals(semester.getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_LOCKED_DATE);
        }

        User reviewer =
                userRepository.findById(reviewerId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Tạo application (status APPROVED ngay, không cần pending)
        PlacementApplication app = PlacementApplication.builder()
                .student(student)
                .enterprise(enterprise)
                .semester(semester)
                .status("APPROVED")
                .coverLetter(
                        request.getNote() != null
                                ? "[Manual Match by TM] " + request.getNote()
                                : "[Manual Match by TM]")
                .reviewedBy(reviewer)
                .reviewedAt(LocalDateTime.now())
                .isReplacement(false)
                .build();
        app = applicationRepository.save(app);

        // Tạo assignment ACTIVE ngay
        EnterpriseAssignment assignment = EnterpriseAssignment.builder()
                .enterprise(enterprise)
                .student(student)
                .semester(semester)
                .status("ACTIVE")
                .assignedBy(reviewer)
                .build();
        assignmentRepository.save(assignment);

        // Auto-complete assignment ACTIVE cũ ở kỳ khác (SV đã lên kỳ mới)
        enterpriseAssignmentService.autoCompletePriorActiveAssignments(student.getUserId(), semester.getSemesterId());

        log.info(
                "Manual match: student {} → enterprise {} by reviewer {}",
                student.getUserId(),
                enterprise.getEnterpriseId(),
                reviewerId);
        return mapper.toDto(app);
    }

    @Override
    @Transactional
    public AutoMatchResultDTO autoMatch(UUID reviewerId) {
        long startTime = System.currentTimeMillis();
        List<AutoMatchResultDTO.MatchDetail> matched = new ArrayList<>();
        List<AutoMatchResultDTO.SkipDetail> skipped = new ArrayList<>();

        Semester semester = getActiveOrOpenSemester();
        if ("LOCKED".equals(semester.getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_LOCKED_DATE);
        }

        // Lấy tất cả APPROVED enterprise
        List<Enterprise> enterprises = enterpriseRepository.findByStatus("APPROVED");
        if (enterprises.isEmpty()) {
            throw new AppException(ErrorCode.NO_AVAILABLE_ENTERPRISE_FOR_MATCH);
        }

        // Lấy tất cả SV eligible trong kỳ hiện tại (chỉ status MATCHED để tránh ACCEPTED quá sớm)
        List<EligibleStudent> eligibleStudents =
                eligibleRepository.findBySemester_SemesterIdAndStatus(semester.getSemesterId(), "MATCHED");

        User reviewer = userRepository.findById(reviewerId).orElse(null);

        for (EligibleStudent eligible : eligibleStudents) {
            UUID studentId = eligible.getUser().getUserId();

            // Filter: SV đã có assignment ACTIVE hoặc pending → skip
            if (applicationRepository.existsActiveAssignmentForStudentInSemester(studentId, semester.getSemesterId())) {
                skipped.add(AutoMatchResultDTO.SkipDetail.builder()
                        .studentId(studentId)
                        .studentName(eligible.getFullName())
                        .reason("Already has active placement")
                        .build());
                continue;
            }

            // Filter: GPA threshold (DB lưu thang 10, threshold 7.0/10)
            if (eligible.getGpa() == null || eligible.getGpa().doubleValue() < AUTO_MATCH_GPA_THRESHOLD) {
                skipped.add(AutoMatchResultDTO.SkipDetail.builder()
                        .studentId(studentId)
                        .studentName(eligible.getFullName())
                        .reason("GPA " + eligible.getGpa() + "/10 below threshold 7.0/10")
                        .build());
                continue;
            }

            // Score DN phù hợp nhất
            Enterprise bestEnt = null;
            double bestScore = -1;
            String bestReason = null;

            for (Enterprise ent : enterprises) {
                double score = 0;
                String reason = "";

                // Major match: nếu industry của DN chứa từ khóa trong major → +50
                String major = eligible.getMajor() != null ? eligible.getMajor().toUpperCase() : "";
                String industry = ent.getIndustry() != null ? ent.getIndustry().toUpperCase() : "";
                if (matchesIndustry(major, industry)) {
                    score += SCORE_MAJOR_MATCH;
                    reason = "Major match (" + ent.getIndustry() + ")";
                }

                // GPA score (DB lưu thang 10, normalize 0-40):
                //   VD: gpa = 7.0 → score = 7.0/10 * 40 = 28
                //       gpa = 10.0 → score = 40
                score += eligible.getGpa().doubleValue() / 10.0 * SCORE_GPA_MAX;

                // Tie-breaker
                score += Math.random() * SCORE_RANDOM_MAX;

                if (score > bestScore) {
                    bestScore = score;
                    bestEnt = ent;
                    bestReason = reason.isEmpty() ? "Highest overall score" : reason;
                }
            }

            if (bestEnt == null) {
                skipped.add(AutoMatchResultDTO.SkipDetail.builder()
                        .studentId(studentId)
                        .studentName(eligible.getFullName())
                        .reason("No enterprise scored")
                        .build());
                continue;
            }

            // Check duplicate: SV đã apply DN này → skip
            Optional<PlacementApplication> existing =
                    applicationRepository.findByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
                            studentId, bestEnt.getEnterpriseId(), semester.getSemesterId());
            if (existing.isPresent()) {
                skipped.add(AutoMatchResultDTO.SkipDetail.builder()
                        .studentId(studentId)
                        .studentName(eligible.getFullName())
                        .reason("Already applied to " + bestEnt.getCompanyName())
                        .build());
                continue;
            }

            // Tạo application PENDING_APPROVAL (TM duyệt riêng)
            PlacementApplication app = PlacementApplication.builder()
                    .student(eligible.getUser())
                    .enterprise(bestEnt)
                    .semester(semester)
                    .status("PENDING_APPROVAL")
                    .coverLetter("[Auto-Match] " + bestReason + " (score: " + String.format("%.1f", bestScore) + ")")
                    .isReplacement(false)
                    .build();
            app = applicationRepository.save(app);

            matched.add(AutoMatchResultDTO.MatchDetail.builder()
                    .studentId(studentId)
                    .studentName(eligible.getFullName())
                    .studentCode(eligible.getStudentCode())
                    .enterpriseId(bestEnt.getEnterpriseId())
                    .enterpriseName(bestEnt.getCompanyName())
                    .applicationId(app.getApplicationId())
                    .score(bestScore)
                    .reason(bestReason)
                    .build());
        }

        // Sort matched theo score giảm dần
        matched.sort(Comparator.comparingDouble(AutoMatchResultDTO.MatchDetail::getScore)
                .reversed());

        long duration = System.currentTimeMillis() - startTime;
        log.info(
                "Auto-match completed by {}: {} matched, {} skipped in {}ms",
                reviewerId,
                matched.size(),
                skipped.size(),
                duration);

        return AutoMatchResultDTO.builder()
                .matchedCount(matched.size())
                .skippedCount(skipped.size())
                .durationMs(duration)
                .details(matched)
                .skipped(skipped)
                .build();
    }

    /**
     * Kiểm tra major có match với industry DN không (keyword matching).
     * Mapping đơn giản:
     *   - SE → Software/IT
     *   - IA → Information Assurance/Security
     *   - AI → AI/Data
     *   - GD → Design/Media
     */
    private boolean matchesIndustry(String major, String industry) {
        if (major.isEmpty() || industry.isEmpty()) return false;

        return switch (major) {
            case "SE" -> industry.contains("SOFTWARE")
                    || industry.contains("IT")
                    || industry.contains("TECHNOLOGY")
                    || industry.contains("DEVELOPMENT");
            case "IA" -> industry.contains("SECURITY")
                    || industry.contains("INFORMATION")
                    || industry.contains("CYBER");
            case "AI" -> industry.contains("AI")
                    || industry.contains("DATA")
                    || industry.contains("MACHINE LEARNING")
                    || industry.contains("ANALYTICS");
            case "GD" -> industry.contains("DESIGN")
                    || industry.contains("MEDIA")
                    || industry.contains("CREATIVE")
                    || industry.contains("GAME");
            default -> false;
        };
    }

    private UUID toUuid(Object o) {
        if (o == null) return null;
        if (o instanceof UUID u) return u;
        return UUID.fromString(o.toString());
    }

    private Semester getActiveOrOpenSemester() {
        // Ưu tiên ACTIVE, fallback OPEN
        List<Semester> active = semesterRepository.findByStatus("ACTIVE");
        if (!active.isEmpty()) return active.get(0);
        List<Semester> open = semesterRepository.findByStatus("OPEN");
        if (!open.isEmpty()) return open.get(0);
        throw new AppException(ErrorCode.NO_ACTIVE_SEMESTER);
    }
}
