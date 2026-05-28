package com.ueims.service.impl;

import com.ueims.model.entity.SemesterEnterprise;
import com.ueims.repository.SemesterEnterpriseRepository;
import com.ueims.service.SemesterEnterpriseService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SemesterEnterpriseServiceImpl implements SemesterEnterpriseService {
    private final SemesterEnterpriseRepository repository;

    @Override
    public List<SemesterEnterprise> findAll() { return repository.findAll(); }

    @Override
    public SemesterEnterprise findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public SemesterEnterprise save(SemesterEnterprise entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
