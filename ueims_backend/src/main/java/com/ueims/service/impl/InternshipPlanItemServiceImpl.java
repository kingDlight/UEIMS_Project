package com.ueims.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.InternshipPlan;
import com.ueims.model.entity.InternshipPlanItem;
import com.ueims.model.entity.Semester;
import com.ueims.repository.InternshipPlanItemRepository;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.InternshipPlanItemService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternshipPlanItemServiceImpl implements InternshipPlanItemService {
    InternshipPlanItemRepository repository;
    InternshipPlanRepository planRepository;
    UserRepository userRepository;

    @Override
    public List<InternshipPlanItem> findAll() {
        return repository.findAll();
    }

    @Override
    public InternshipPlanItem findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public InternshipPlanItem save(InternshipPlanItem entity) {
        if (entity.getPlan() == null || entity.getPlan().getPlanId() == null) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }
        // BR-38: Task Description is mandatory
        if (entity.getTaskDescription() == null || entity.getTaskDescription().isBlank()) {
            throw new AppException(ErrorCode.FIELD_REQUIRED, "Task description is mandatory");
        }
        // BR-38: Target Date is mandatory
        if (entity.getTargetDate() == null) {
            throw new AppException(ErrorCode.FIELD_REQUIRED, "Target date is mandatory");
        }

        InternshipPlan plan = planRepository
                .findById(entity.getPlan().getPlanId())
                .orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND, "Plan not found"));

        // Ownership check: only enterprise owning the assignment can save
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var currentUser = userRepository.findByEmail(email).orElse(null);
        if (currentUser == null
                || currentUser.getEnterprise() == null
                || plan.getAssignment() == null
                || plan.getAssignment().getEnterprise() == null
                || !plan.getAssignment()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-39: Target date must be within semester boundary
        Semester semester = plan.getAssignment().getSemester();
        if (semester != null
                && (entity.getTargetDate().isBefore(semester.getStartDate())
                        || entity.getTargetDate().isAfter(semester.getEndDate()))) {
            throw new AppException(
                    ErrorCode.SEMESTER_INVALID_DATE,
                    "Target date must be within the semester boundaries ("
                            + semester.getStartDate() + " to " + semester.getEndDate() + ")");
        }

        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
