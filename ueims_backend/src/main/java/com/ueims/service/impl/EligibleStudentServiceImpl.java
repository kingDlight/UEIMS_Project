package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.EligibleStudent;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.service.EligibleStudentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EligibleStudentServiceImpl implements EligibleStudentService {
    private final EligibleStudentRepository repository;

    @Override
    public List<EligibleStudent> findAll() {
        return repository.findAll();
    }

    @Override
    public EligibleStudent findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public EligibleStudent save(EligibleStudent entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
