package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.service.EnterpriseAssignmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnterpriseAssignmentServiceImpl implements EnterpriseAssignmentService {
    private final EnterpriseAssignmentRepository repository;

    @Override
    public List<EnterpriseAssignment> findAll() {
        return repository.findAll();
    }

    @Override
    public EnterpriseAssignment findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public EnterpriseAssignment save(EnterpriseAssignment entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
