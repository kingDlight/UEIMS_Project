package com.ueims.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.InternshipPlan;
import com.ueims.model.entity.InternshipPlanItem;
import com.ueims.model.entity.Semester;
import com.ueims.repository.InternshipPlanItemRepository;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.service.InternshipPlanItemService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InternshipPlanItemServiceImpl implements InternshipPlanItemService {
    private final InternshipPlanItemRepository repository;
    private final InternshipPlanRepository planRepository;

    @Override
    public List<InternshipPlanItem> findAll() {
        return repository.findAll();
    }

    @Override
    public InternshipPlanItem findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public InternshipPlanItem save(InternshipPlanItem entity) {
        if (entity.getPlan() == null || entity.getPlan().getPlanId() == null) {
            throw new IllegalArgumentException("Plan ID is required");
        }

        InternshipPlan plan = planRepository
                .findById(entity.getPlan().getPlanId())
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));

        Semester semester = plan.getAssignment().getSemester();
        LocalDate targetDate = entity.getTargetDate();

        if (targetDate != null
                && semester != null
                && (targetDate.isBefore(semester.getStartDate()) || targetDate.isAfter(semester.getEndDate()))) {
            throw new IllegalArgumentException("Target date must be within the semester boundaries ("
                    + semester.getStartDate() + " to " + semester.getEndDate() + ")");
        }

        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
