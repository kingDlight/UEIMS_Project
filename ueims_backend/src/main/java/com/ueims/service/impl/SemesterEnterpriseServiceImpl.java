package com.ueims.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.SemesterEnterprise;
import com.ueims.model.entity.SemesterEnterpriseId;
import com.ueims.repository.SemesterEnterpriseRepository;
import com.ueims.service.SemesterEnterpriseService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SemesterEnterpriseServiceImpl implements SemesterEnterpriseService {
    private final SemesterEnterpriseRepository repository;

    @Override
    public List<SemesterEnterprise> findAll() {
        return repository.findAll();
    }

    @Override
    public SemesterEnterprise findById(SemesterEnterpriseId id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public SemesterEnterprise save(SemesterEnterprise entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(SemesterEnterpriseId id) {
        repository.deleteById(id);
    }
}
