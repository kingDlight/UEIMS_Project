package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.AuditLog;

public interface AuditLogService {
    List<AuditLog> findAll();

    AuditLog findById(UUID id);

    AuditLog save(AuditLog entity);

    void deleteById(UUID id);
}
