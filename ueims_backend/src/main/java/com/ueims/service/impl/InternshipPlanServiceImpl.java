package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.InternshipPlan;
import com.ueims.repository.InternshipPlanItemRepository;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.service.InternshipPlanService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InternshipPlanServiceImpl implements InternshipPlanService {
    private final InternshipPlanRepository repository;
    private final InternshipPlanItemRepository itemRepository;

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
    public InternshipPlan save(InternshipPlan entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
