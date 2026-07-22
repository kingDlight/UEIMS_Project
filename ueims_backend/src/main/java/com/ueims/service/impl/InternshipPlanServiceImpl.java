package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.response.InternshipPlanDTO;
import com.ueims.dto.response.InternshipPlanRevisionDTO;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.InternshipPlan;
import com.ueims.model.entity.InternshipPlanRevision;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.Notification;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.InternshipPlanItemRepository;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.repository.InternshipPlanRevisionRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.InternshipPlanService;
import com.ueims.service.NotificationService;
import com.ueims.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class InternshipPlanServiceImpl implements InternshipPlanService {

    InternshipPlanRepository repository;
    InternshipPlanItemRepository itemRepository;
    InternshipPlanRevisionRepository revisionRepository;
    EnterpriseRepository enterpriseRepository;
    SemesterRepository semesterRepository;
    JobPostRepository jobPostRepository;
    UserRepository userRepository;
    NotificationService notificationService;
    UserService userService;

    @Override
    public List<InternshipPlan> findAll() {
        return repository.findAll();
    }

    @Override
    public InternshipPlan findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public InternshipPlan findMyPlan(UUID studentId) {
        InternshipPlan plan = repository.findActivePlanForStudent(studentId).orElse(null);
        if (plan != null) {
            plan.setItems(itemRepository.findByPlan_PlanId(plan.getPlanId()));
        }
        return plan;
    }

    @Override
    @Transactional(readOnly = true)
    public InternshipPlan findByEnterpriseAndSemester(UUID enterpriseId, UUID semesterId) {
        InternshipPlan plan = repository
                .findByEnterprise_EnterpriseIdAndSemester_SemesterId(enterpriseId, semesterId)
                .orElse(null);
        if (plan != null) {
            plan.setItems(itemRepository.findByPlan_PlanId(plan.getPlanId()));
        }
        return plan;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InternshipPlan> findPendingMasterPlans() {
        return repository.findAllPending().stream()
                .map(plan -> {
                    plan.setItems(itemRepository.findByPlan_PlanId(plan.getPlanId()));
                    return plan;
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InternshipPlanRevisionDTO> getRevisions(UUID planId) {
        List<InternshipPlanRevision> rows = revisionRepository.findByPlanIdOrderByCreatedAtDesc(planId);

        // Bulk-load actor names để tránh N+1
        List<UUID> actorIds =
                rows.stream().map(InternshipPlanRevision::getActorId).distinct().toList();
        Map<UUID, String> nameMap = new HashMap<>();
        for (User u : userRepository.findAllById(actorIds)) {
            String name = u.getFullName();
            if (name == null || name.isBlank()) name = u.getEmail();
            nameMap.put(u.getUserId(), name);
        }

        return rows.stream()
                .map(r -> InternshipPlanRevisionDTO.from(r, nameMap.getOrDefault(r.getActorId(), "Unknown")))
                .toList();
    }

    @Override
    @Transactional
    public InternshipPlan approveMasterPlan(UUID planId, UUID reviewerId) {
        InternshipPlan plan = repository
                .findById(planId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Plan not found"));

        if (!"PENDING_APPROVAL".equals(plan.getStatus())) {
            throw new AppException(ErrorCode.RESOURCE_INVALID_STATE, "Plan is not pending approval");
        }

        User reviewer =
                userRepository.findById(reviewerId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (plan.getSemester() != null && "LOCKED".equals(plan.getSemester().getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_LOCKED_DATE);
        }

        String fromStatus = plan.getStatus();
        plan.setStatus("APPROVED");
        plan.setApprovedBy(reviewer);
        plan.setApprovedAt(LocalDateTime.now());
        plan.setLastReviewedBy(reviewer);
        plan.setLastReviewedAt(LocalDateTime.now());
        plan.setRejectionReason(null);
        InternshipPlan saved = repository.save(plan);

        logRevision(saved.getPlanId(), reviewerId, "TRAINING_MANAGER", "APPROVED", null, fromStatus, "APPROVED");

        // Notify enterprise
        if (plan.getEnterprise() != null) {
            List<User> enterpriseUsers = userRepository.findActiveUsersByRoleName("ENTERPRISE").stream()
                    .filter(u -> u.getEnterprise() != null
                            && plan.getEnterprise()
                                    .getEnterpriseId()
                                    .equals(u.getEnterprise().getEnterpriseId()))
                    .toList();
            for (User entUser : enterpriseUsers) {
                Notification notif = Notification.builder()
                        .recipient(entUser)
                        .title("Internship Plan Approved")
                        .message("Your internship plan for semester "
                                + plan.getSemester().getSemesterCode()
                                + " has been approved by the Training Manager.")
                        .type("PLAN_APPROVED")
                        .referenceEntity("InternshipPlan")
                        .referenceId(saved.getPlanId())
                        .build();
                notificationService.save(notif);
            }
        }

        log.info("Plan {} APPROVED by reviewer {}", planId, reviewerId);
        return saved;
    }

    @Override
    @Transactional
    public InternshipPlan rejectMasterPlan(UUID planId, UUID reviewerId, String reason) {
        if (reason == null || reason.trim().length() < 5) {
            throw new AppException(ErrorCode.REJECTION_REASON_REQUIRED);
        }

        InternshipPlan plan = repository
                .findById(planId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Plan not found"));

        if (!"PENDING_APPROVAL".equals(plan.getStatus())) {
            throw new AppException(ErrorCode.RESOURCE_INVALID_STATE, "Plan is not pending approval");
        }

        User reviewer =
                userRepository.findById(reviewerId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String fromStatus = plan.getStatus();
        plan.setStatus("REJECTED");
        plan.setRejectionReason(reason.trim());
        plan.setApprovedBy(reviewer);
        plan.setApprovedAt(LocalDateTime.now());
        plan.setLastReviewedBy(reviewer);
        plan.setLastReviewedAt(LocalDateTime.now());
        InternshipPlan saved = repository.save(plan);

        logRevision(
                saved.getPlanId(), reviewerId, "TRAINING_MANAGER", "REJECTED", reason.trim(), fromStatus, "REJECTED");

        // Notify enterprise
        if (plan.getEnterprise() != null) {
            List<User> enterpriseUsers = userRepository.findActiveUsersByRoleName("ENTERPRISE").stream()
                    .filter(u -> u.getEnterprise() != null
                            && plan.getEnterprise()
                                    .getEnterpriseId()
                                    .equals(u.getEnterprise().getEnterpriseId()))
                    .toList();
            for (User entUser : enterpriseUsers) {
                Notification notif = Notification.builder()
                        .recipient(entUser)
                        .title("Internship Plan Rejected")
                        .message("Your internship plan for semester "
                                + plan.getSemester().getSemesterCode()
                                + " has been rejected. Reason: " + reason)
                        .type("PLAN_REJECTED")
                        .referenceEntity("InternshipPlan")
                        .referenceId(saved.getPlanId())
                        .build();
                notificationService.save(notif);
            }
        }

        log.info("Plan {} REJECTED by reviewer {}", planId, reviewerId);
        return saved;
    }

    /**
     * Enterprise upsert plan:
     * - Chưa có                  → INSERT, action SUBMITTED, status = PENDING_APPROVAL.
     * - Có + REJECTED            → UPDATE in-place, action REVISED, tăng revision_count,
     *                              lưu revision_note, status = PENDING_APPROVAL, xoá rejection_reason.
     * - Có + APPROVED            → throw lỗi.
     * - Có + PENDING_APPROVAL    → UPDATE in-place, action REVISED (Enterprise sửa trước khi TM review).
     */
    @Override
    @Transactional
    public InternshipPlan upsertPlan(InternshipPlanDTO dto, UUID enterpriseId) {
        // Validate enterprise
        Enterprise enterprise = enterpriseRepository
                .findById(enterpriseId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTERPRISE_NOT_FOUND));

        // Validate semester — must happen before any check that needs the
        // semester id (e.g. looking up the existing plan for resubmit logic).
        Semester semester = semesterRepository
                .findById(dto.getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));

        // Validate required fields — an empty training plan is meaningless and
        // previously slipped through, allowing the enterprise to "Save & Submit"
        // a blank plan and instantly move it into PENDING_APPROVAL. TM would
        // then have nothing to review. Items are sent by the FE via a separate
        // service (InternshipPlanItemService.create) and are validated there.
        String goal = dto.getOverallGoal() == null ? "" : dto.getOverallGoal().trim();
        if (goal.isEmpty()) {
            throw new AppException(ErrorCode.FIELD_REQUIRED, "Overall goal is required");
        }
        // FIX: when revising after a TM reject the enterprise must explain what
        // changed and why — without this TM is forced to guess and the audit
        // log loses the context behind each resubmission. First-time submissions
        // don't require a note (nothing has been changed).
        Optional<InternshipPlan> existingForNote =
                repository.findByEnterprise_EnterpriseIdAndSemester_SemesterId(enterpriseId, semester.getSemesterId());
        boolean isResubmit = existingForNote.isPresent()
                && "REJECTED".equals(existingForNote.get().getStatus());
        String revisionNote =
                dto.getRevisionNote() == null ? "" : dto.getRevisionNote().trim();
        if (isResubmit && revisionNote.isEmpty()) {
            throw new AppException(
                    ErrorCode.FIELD_REQUIRED, "Revision note is required when resubmitting after a rejection");
        }

        if ("LOCKED".equals(semester.getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_LOCKED_DATE);
        }

        // Optional jobPost
        JobPost jobPost = null;
        if (dto.getJobPostId() != null) {
            jobPost = jobPostRepository
                    .findById(dto.getJobPostId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Job Post not found"));

            if (!enterpriseId.equals(jobPost.getEnterprise().getEnterpriseId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            if (!semester.getSemesterId().equals(jobPost.getSemester().getSemesterId())) {
                throw new AppException(ErrorCode.RESOURCE_INVALID_STATE, "JobPost does not belong to this semester");
            }
        }

        // Tìm plan hiện có
        Optional<InternshipPlan> existingOpt =
                repository.findByEnterprise_EnterpriseIdAndSemester_SemesterId(enterpriseId, semester.getSemesterId());

        InternshipPlan saved;
        String action;
        if (existingOpt.isPresent()) {
            InternshipPlan existing = existingOpt.get();
            if ("APPROVED".equals(existing.getStatus())) {
                throw new AppException(
                        ErrorCode.RESOURCE_INVALID_STATE,
                        "Cannot modify an APPROVED training plan. Please contact TM to make changes.");
            }

            String fromStatus = existing.getStatus();
            boolean wasRejected = "REJECTED".equals(fromStatus);

            existing.setOverallGoal(dto.getOverallGoal());
            existing.setStatus("PENDING_APPROVAL");
            existing.setRejectionReason(null);
            if (jobPost != null) {
                existing.setJobPost(jobPost);
            }

            // FIX 004: revision tracking — chỉ tăng count khi revise sau reject
            if (wasRejected) {
                existing.setRevisionCount(existing.getRevisionCount() == null ? 1 : existing.getRevisionCount() + 1);
                existing.setLastRevisionAt(LocalDateTime.now());
                existing.setRevisionNote(dto.getRevisionNote());
            }

            saved = repository.save(existing);
            action = wasRejected ? "REVISED" : "SUBMITTED";
        } else {
            InternshipPlan plan = InternshipPlan.builder()
                    .enterprise(enterprise)
                    .semester(semester)
                    .jobPost(jobPost)
                    .overallGoal(dto.getOverallGoal())
                    .status("PENDING_APPROVAL")
                    .revisionCount(0)
                    .build();
            saved = repository.save(plan);
            action = "SUBMITTED";
        }

        // Ghi audit log — actor_id must reference users.user_id, not the
        // enterprise_id. Previously this passed `enterpriseId` which violated
        // FK `internship_plan_revisions_actor_id_fkey` because enterprise IDs
        // are a separate namespace and not present in the users table.
        UUID actorUserId = userService.getCurrentUserId();
        logRevision(
                saved.getPlanId(),
                actorUserId,
                "ENTERPRISE",
                action,
                dto.getRevisionNote(),
                existingOpt.map(InternshipPlan::getStatus).orElse(null),
                "PENDING_APPROVAL");

        // Notify TM
        List<User> tms = userRepository.findActiveUsersByRoleName("TRAINING_MANAGER");
        for (User tm : tms) {
            String verb = "REVISED".equals(action) ? "revised and re-submitted" : "submitted";
            String title =
                    "REVISED".equals(action) ? "Internship Plan Re-submitted" : "Internship Plan Pending Approval";
            Notification notif = Notification.builder()
                    .recipient(tm)
                    .title(title)
                    .message("Enterprise " + enterprise.getCompanyName()
                            + " has " + verb + " a training plan for semester "
                            + semester.getSemesterCode()
                            + (dto.getRevisionNote() != null
                                            && !dto.getRevisionNote().isBlank()
                                    ? ". Revision note: " + dto.getRevisionNote()
                                    : ""))
                    .type("PLAN_PENDING")
                    .referenceEntity("InternshipPlan")
                    .referenceId(saved.getPlanId())
                    .build();
            notificationService.save(notif);
        }

        log.info(
                "Plan {} {} by enterprise {} for semester {}",
                saved.getPlanId(),
                action,
                enterpriseId,
                semester.getSemesterId());
        return saved;
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    private void logRevision(
            UUID planId,
            UUID actorId,
            String actorRole,
            String action,
            String note,
            String fromStatus,
            String toStatus) {
        InternshipPlanRevision rev = InternshipPlanRevision.builder()
                .planId(planId)
                .actorId(actorId)
                .actorRole(actorRole)
                .action(action)
                .note(note)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .createdAt(LocalDateTime.now())
                .build();
        revisionRepository.save(rev);
    }
}
