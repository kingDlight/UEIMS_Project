package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.InternshipPlan;
import com.ueims.repository.InternshipPlanItemRepository;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.InternshipPlanService;

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
        // The repo has no single-entity finder; pick the first result if any.
        List<InternshipPlan> plans = repository.findByAssignment_AssignmentId(assignmentId);
        InternshipPlan plan = plans.isEmpty() ? null : plans.get(0);
        if (plan != null) {
            plan.setItems(itemRepository.findByPlan_PlanId(plan.getPlanId()));
        }
        return plan;
    }

    @Override
    @Transactional
    public InternshipPlan save(InternshipPlan entity) {
        if (entity.getAssignment() == null || entity.getAssignment().getAssignmentId() == null) {
            throw new AppException(ErrorCode.FIELD_REQUIRED, "Assignment is required");
        }

        EnterpriseAssignment realAssignment = assignmentRepository
                .findById(entity.getAssignment().getAssignmentId())
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND, "Assignment not found"));
        entity.setAssignment(realAssignment);

        // Ownership: only the enterprise that owns the assignment can save the plan
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var currentUser = userRepository.findByEmail(email).orElse(null);
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
        // Upsert logic to prevent duplicate key violations (internship_plans_assignment_id_key)
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
