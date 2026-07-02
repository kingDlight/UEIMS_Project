package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.response.InternshipPlanDTO;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.InternshipPlan;
import com.ueims.model.entity.InternshipPlanItem;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.Notification;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.InternshipPlanItemRepository;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.InternshipPlanService;
import com.ueims.service.NotificationService;

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
    EnterpriseRepository enterpriseRepository;
    SemesterRepository semesterRepository;
    JobPostRepository jobPostRepository;
    UserRepository userRepository;
    NotificationService notificationService;

    @Override
    public List<InternshipPlan> findAll() {
        return repository.findAll();
    }

    @Override
    public InternshipPlan findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    /**
     * Plan SV có thể thấy:
     * - status = APPROVED
     * - SV có assignment ACTIVE ở đúng enterprise + semester của plan
     */
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

        plan.setStatus("APPROVED");
        plan.setApprovedBy(reviewer);
        plan.setApprovedAt(LocalDateTime.now());
        plan.setRejectionReason(null);
        InternshipPlan saved = repository.save(plan);

        // Notify enterprise
        if (plan.getEnterprise() != null) {
            List<User> enterpriseUsers =
                    userRepository.findActiveUsersByRoleName("ENTERPRISE").stream()
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

        plan.setStatus("REJECTED");
        plan.setRejectionReason(reason.trim());
        plan.setApprovedBy(reviewer);
        plan.setApprovedAt(LocalDateTime.now());
        InternshipPlan saved = repository.save(plan);

        // Notify enterprise
        if (plan.getEnterprise() != null) {
            List<User> enterpriseUsers =
                    userRepository.findActiveUsersByRoleName("ENTERPRISE").stream()
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
     * Enterprise upsert plan (1 plan / DN / kỳ):
     * - Nếu chưa có: tạo mới với status = PENDING_APPROVAL
     * - Nếu đã có PENDING_APPROVAL hoặc REJECTED: update + reset về PENDING_APPROVAL
     * - Nếu đã APPROVED: throw lỗi (giảng viên muốn strict, không cho sửa plan APPROVED)
     */
    @Override
    @Transactional
    public InternshipPlan upsertPlan(InternshipPlanDTO dto, UUID enterpriseId) {
        // Validate enterprise
        Enterprise enterprise = enterpriseRepository
                .findById(enterpriseId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTERPRISE_NOT_FOUND));

        // Validate semester
        Semester semester = semesterRepository
                .findById(dto.getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));

        if ("LOCKED".equals(semester.getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_LOCKED_DATE);
        }

        // Optional jobPost (chỉ để tham chiếu, không bắt buộc)
        JobPost jobPost = null;
        if (dto.getJobPostId() != null) {
            jobPost = jobPostRepository
                    .findById(dto.getJobPostId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Job Post not found"));

            // jobPost phải thuộc DN này
            if (!enterpriseId.equals(jobPost.getEnterprise().getEnterpriseId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            // jobPost phải cùng semester
            if (!semester.getSemesterId().equals(jobPost.getSemester().getSemesterId())) {
                throw new AppException(ErrorCode.RESOURCE_INVALID_STATE, "JobPost does not belong to this semester");
            }
        }

        // Tìm plan hiện có
        Optional<InternshipPlan> existingOpt =
                repository.findByEnterprise_EnterpriseIdAndSemester_SemesterId(enterpriseId, semester.getSemesterId());

        InternshipPlan saved;
        if (existingOpt.isPresent()) {
            InternshipPlan existing = existingOpt.get();
            if ("APPROVED".equals(existing.getStatus())) {
                throw new AppException(
                        ErrorCode.RESOURCE_INVALID_STATE,
                        "Cannot modify an APPROVED training plan. Please contact TM to make changes.");
            }
            existing.setOverallGoal(dto.getOverallGoal());
            existing.setStatus("PENDING_APPROVAL");
            existing.setRejectionReason(null);
            if (jobPost != null) {
                existing.setJobPost(jobPost);
            }
            saved = repository.save(existing);
        } else {
            InternshipPlan plan = InternshipPlan.builder()
                    .enterprise(enterprise)
                    .semester(semester)
                    .jobPost(jobPost)
                    .overallGoal(dto.getOverallGoal())
                    .status("PENDING_APPROVAL")
                    .build();
            saved = repository.save(plan);
        }

        // Notify TM
        List<User> tms = userRepository.findActiveUsersByRoleName("TRAINING_MANAGER");
        for (User tm : tms) {
            Notification notif = Notification.builder()
                    .recipient(tm)
                    .title("Internship Plan Pending Approval")
                    .message("Enterprise " + enterprise.getCompanyName()
                            + " has submitted a training plan for semester "
                            + semester.getSemesterCode())
                    .type("PLAN_PENDING")
                    .referenceEntity("InternshipPlan")
                    .referenceId(saved.getPlanId())
                    .build();
            notificationService.save(notif);
        }

        log.info("Plan {} saved by enterprise {} for semester {}", saved.getPlanId(), enterpriseId, semester.getSemesterId());
        return saved;
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}