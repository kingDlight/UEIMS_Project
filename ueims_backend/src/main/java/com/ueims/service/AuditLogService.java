package com.ueims.service;

import com.ueims.model.entity.AuditLog;
import java.util.List;
import java.util.UUID;

public interface AuditLogService {
    List<AuditLog> findAll();
    AuditLog findById(UUID id);
    AuditLog save(AuditLog entity);
    void deleteById(UUID id);
}
