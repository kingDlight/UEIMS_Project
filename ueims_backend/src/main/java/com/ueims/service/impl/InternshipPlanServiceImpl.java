package com.ueims.service.impl;

import com.ueims.model.entity.InternshipPlan;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.service.InternshipPlanService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InternshipPlanServiceImpl implements InternshipPlanService {
    private final InternshipPlanRepository repository;

    @Override
    public List<InternshipPlan> findAll() { return repository.findAll(); }

    @Override
    public InternshipPlan findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public InternshipPlan save(InternshipPlan entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
