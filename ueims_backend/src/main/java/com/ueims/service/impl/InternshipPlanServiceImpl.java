package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.InternshipPlan;
import com.ueims.model.entity.InternshipPlanItem;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.Notification;
import com.ueims.repository.InternshipPlanItemRepository;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.InternshipPlanService;
import com.ueims.service.NotificationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternshipPlanServiceImpl implements InternshipPlanService {
    private final InternshipPlanRepository repository;
    private final InternshipPlanItemRepository itemRepository;
    private final UserRepository userRepository;
    private final com.ueims.repository.EnterpriseAssignmentRepository assignmentRepository;
    private final JobPostRepository jobPostRepository;
    private final com.ueims.repository.ApplicationRepository applicationRepository;
    private final NotificationService notificationService;

    @Override
    public List<InternshipPlan> findAll() {
        return repository.findAll();
    }

    @Override
    public InternshipPlan findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public InternshipPlan findMyPlan(UUID studentId) {
        InternshipPlan plan = repository.findByAssignment_Student_UserId(studentId);
        if (plan != null) {
            plan.setItems(itemRepository.findByPlan_PlanId(plan.getPlanId()));
        }
        return plan;
    }

    @Override
    public InternshipPlan findByAssignmentId(UUID assignmentId) {
        List<InternshipPlan> plans = repository.findByAssignment_AssignmentId(assignmentId);
        InternshipPlan plan = plans.isEmpty() ? null : plans.get(0);
        if (plan != null) {
            plan.setItems(itemRepository.findByPlan_PlanId(plan.getPlanId()));
        }
        return plan;
    }

    @Override
    public InternshipPlan findByJobPostId(UUID jobPostId) {
        List<InternshipPlan> plans = repository.findByJobPost_JobPostId(jobPostId);
        InternshipPlan plan = plans.isEmpty() ? null : plans.get(0);
        if (plan != null) {
            plan.setItems(itemRepository.findByPlan_PlanId(plan.getPlanId()));
        }
        return plan;
    }

    @Override
    public List<InternshipPlan> findPendingMasterPlans() {
        return repository.findByStatus("PENDING_APPROVAL").stream()
                .map(plan -> {
                    plan.setItems(itemRepository.findByPlan_PlanId(plan.getPlanId()));
                    return plan;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InternshipPlan approveMasterPlan(UUID planId) {
        InternshipPlan masterPlan = repository
                .findById(planId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Plan not found"));

        masterPlan.setStatus("APPROVED");
        masterPlan.setRejectionReason(null);
        repository.save(masterPlan);

        if (masterPlan.getJobPost() != null) {
            List<InternshipPlanItem> masterItems = itemRepository.findByPlan_PlanId(masterPlan.getPlanId());

            // Auto match to students who were accepted for this JobPost
            List<com.ueims.model.entity.Application> acceptedApps =
                    applicationRepository
                            .findByJobPost_JobPostId(masterPlan.getJobPost().getJobPostId())
                            .stream()
                            .filter(a -> "ACCEPTED".equals(a.getStatus().name()))
                            .toList();

            for (com.ueims.model.entity.Application app : acceptedApps) {
                // Find active assignment for this student in the same semester and enterprise
                EnterpriseAssignment assignment = assignmentRepository
                        .findByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterIdAndStatus(
                                app.getStudent().getUserId(),
                                app.getJobPost().getEnterprise().getEnterpriseId(),
                                app.getJobPost().getSemester().getSemesterId(),
                                "ACTIVE")
                        .orElse(null);

                if (assignment != null) {
                    // Check if student already has a plan
                    List<InternshipPlan> existingPlans =
                            repository.findByAssignment_AssignmentId(assignment.getAssignmentId());
                    if (existingPlans.isEmpty()) {
                        // Clone master plan
                        InternshipPlan studentPlan = InternshipPlan.builder()
                                .assignment(assignment)
                                .overallGoal(masterPlan.getOverallGoal())
                                .status("APPROVED")
                                .build();
                        repository.save(studentPlan);

                        for (InternshipPlanItem item : masterItems) {
                            InternshipPlanItem clonedItem = InternshipPlanItem.builder()
                                    .plan(studentPlan)
                                    .weekNumber(item.getWeekNumber())
                                    .taskDescription(item.getTaskDescription())
                                    .targetDate(item.getTargetDate())
                                    .status("PENDING")
                                    .orderIndex(item.getOrderIndex())
                                    .build();
                            itemRepository.save(clonedItem);
                        }
                    }
                }
            }
        }

        // Notify Enterprise
        if (masterPlan.getJobPost() != null && masterPlan.getJobPost().getCreatedBy() != null) {
            Notification notif = Notification.builder()
                    .recipient(masterPlan.getJobPost().getCreatedBy())
                    .title("Internship Plan Approved")
                    .message("Your internship plan for job post "
                            + masterPlan.getJobPost().getTitle() + " has been approved by the Training Manager.")
                    .type("PLAN_APPROVED")
                    .referenceEntity("InternshipPlan")
                    .referenceId(masterPlan.getPlanId())
                    .build();
            notificationService.save(notif);
        }

        return masterPlan;
    }

    @Override
    @Transactional
    public InternshipPlan rejectMasterPlan(UUID planId, String reason) {
        InternshipPlan masterPlan = repository
                .findById(planId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Plan not found"));

        masterPlan.setStatus("REJECTED");
        masterPlan.setRejectionReason(reason);
        repository.save(masterPlan);

        // Notify Enterprise
        if (masterPlan.getJobPost() != null && masterPlan.getJobPost().getCreatedBy() != null) {
            Notification notif = Notification.builder()
                    .recipient(masterPlan.getJobPost().getCreatedBy())
                    .title("Internship Plan Rejected")
                    .message("Your internship plan for job post "
                            + masterPlan.getJobPost().getTitle() + " has been rejected. Reason: " + reason)
                    .type("PLAN_REJECTED")
                    .referenceEntity("InternshipPlan")
                    .referenceId(masterPlan.getPlanId())
                    .build();
            notificationService.save(notif);
        }

        return masterPlan;
    }

    @Override
    @Transactional
    public InternshipPlan save(InternshipPlan entity) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var currentUser = userRepository.findByEmail(email).orElse(null);

        // Check if saving a Master Plan (Job Post based)
        if (entity.getJobPost() != null && entity.getJobPost().getJobPostId() != null) {
            JobPost realJobPost = jobPostRepository
                    .findById(entity.getJobPost().getJobPostId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Job Post not found"));
            entity.setJobPost(realJobPost);

            if (currentUser == null
                    || currentUser.getEnterprise() == null
                    || !realJobPost
                            .getEnterprise()
                            .getEnterpriseId()
                            .equals(currentUser.getEnterprise().getEnterpriseId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            entity.setStatus("PENDING_APPROVAL");
            entity.setRejectionReason(null);

            InternshipPlan savedPlan;
            if (entity.getPlanId() == null) {
                List<InternshipPlan> existingPlans = repository.findByJobPost_JobPostId(realJobPost.getJobPostId());
                if (!existingPlans.isEmpty()) {
                    InternshipPlan existingPlan = existingPlans.get(0);
                    existingPlan.setOverallGoal(entity.getOverallGoal());
                    existingPlan.setStatus("PENDING_APPROVAL");
                    existingPlan.setRejectionReason(null);
                    savedPlan = repository.save(existingPlan);
                } else {
                    savedPlan = repository.save(entity);
                }
            } else {
                InternshipPlan existingPlan =
                        repository.findById(entity.getPlanId()).orElse(null);
                if (existingPlan != null) {
                    existingPlan.setOverallGoal(entity.getOverallGoal());
                    existingPlan.setStatus("PENDING_APPROVAL");
                    existingPlan.setRejectionReason(null);
                    savedPlan = repository.save(existingPlan);
                } else {
                    savedPlan = repository.save(entity);
                }
            }

            // Notify TM
            List<com.ueims.model.entity.User> tms = userRepository.findActiveUsersByRoleName("TRAINING_MANAGER");
            for (com.ueims.model.entity.User tm : tms) {
                Notification notif = Notification.builder()
                        .recipient(tm)
                        .title("New Internship Plan Pending Approval")
                        .message("Enterprise " + currentUser.getEnterprise().getCompanyName()
                                + " has submitted a new internship plan for Job Post: " + realJobPost.getTitle())
                        .type("PLAN_PENDING")
                        .referenceEntity("InternshipPlan")
                        .referenceId(savedPlan.getPlanId())
                        .build();
                notificationService.save(notif);
            }

            return savedPlan;
        }

        // Saving student plan (fallback, normally shouldn't be used by enterprise anymore)
        if (entity.getAssignment() == null || entity.getAssignment().getAssignmentId() == null) {
            throw new AppException(ErrorCode.FIELD_REQUIRED, "Assignment or JobPost is required");
        }

        EnterpriseAssignment realAssignment = assignmentRepository
                .findById(entity.getAssignment().getAssignmentId())
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND, "Assignment not found"));
        entity.setAssignment(realAssignment);

        // Ownership: only the enterprise that owns the assignment can save the plan
        var assignment = entity.getAssignment();
        if (currentUser == null
                || currentUser.getEnterprise() == null
                || assignment.getEnterprise() == null
                || !assignment
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (entity.getPlanId() == null) {
            List<InternshipPlan> existingPlans =
                    repository.findByAssignment_AssignmentId(realAssignment.getAssignmentId());
            if (!existingPlans.isEmpty()) {
                InternshipPlan existingPlan = existingPlans.get(0);
                existingPlan.setOverallGoal(entity.getOverallGoal());
                return repository.save(existingPlan);
            }
        } else {
            InternshipPlan existingPlan =
                    repository.findById(entity.getPlanId()).orElse(null);
            if (existingPlan != null) {
                existingPlan.setOverallGoal(entity.getOverallGoal());
                return repository.save(existingPlan);
            }
        }

        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
