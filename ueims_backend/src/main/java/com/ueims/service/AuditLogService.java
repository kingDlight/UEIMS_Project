package com.ueims.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.AuditLog;

public interface AuditLogService {
    List<AuditLog> findAll();

    AuditLog findById(UUID id);

    byte[] exportExcel(LocalDate startDate, LocalDate endDate);
}
