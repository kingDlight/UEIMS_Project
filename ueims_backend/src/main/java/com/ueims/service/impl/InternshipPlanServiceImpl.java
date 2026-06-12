package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.InternshipPlan;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.service.InternshipPlanService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternshipPlanServiceImpl implements InternshipPlanService {
    InternshipPlanRepository repository;

    @Override
    public List<InternshipPlan> findAll() {
        return repository.findAll();
    }

    @Override
    public InternshipPlan findById(UUID id) {
        return repository.findById(id).orElse(null);
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
