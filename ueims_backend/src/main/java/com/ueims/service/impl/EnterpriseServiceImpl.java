package com.ueims.service.impl;

import com.ueims.model.entity.Enterprise;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.service.EnterpriseService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnterpriseServiceImpl implements EnterpriseService {
    private final EnterpriseRepository repository;

    @Override
    public List<Enterprise> findAll() { return repository.findAll(); }

    @Override
    public Enterprise findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public Enterprise save(Enterprise entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
