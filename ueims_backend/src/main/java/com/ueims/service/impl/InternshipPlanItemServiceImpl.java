package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.InternshipPlanItem;
import com.ueims.repository.InternshipPlanItemRepository;
import com.ueims.service.InternshipPlanItemService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InternshipPlanItemServiceImpl implements InternshipPlanItemService {
    private final InternshipPlanItemRepository repository;

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
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
