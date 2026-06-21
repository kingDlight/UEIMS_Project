package com.ueims.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.ueims.dto.response.AuditLogResponseDTO;

public interface AuditLogService {
    List<AuditLogResponseDTO> findAll();

    AuditLogResponseDTO findById(UUID id);

    byte[] exportExcel(LocalDate startDate, LocalDate endDate, String action);
}
