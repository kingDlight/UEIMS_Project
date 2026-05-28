package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.AuditLog;
import com.ueims.repository.AuditLogRepository;
import com.ueims.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {
    private final AuditLogRepository repository;

    @Override
    public List<AuditLog> findAll() {
        return repository.findAll();
    }

    @Override
    public AuditLog findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public AuditLog save(AuditLog entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
