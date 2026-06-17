package com.ueims.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ueims.dto.response.RequestLogResponseDTO;
import com.ueims.model.entity.RequestLog;
import com.ueims.model.entity.RequestLog.HttpMethod;

public interface RequestLogService {
    void logRequest(RequestLog requestLog);

    Page<RequestLogResponseDTO> searchLogs(
            UUID userId,
            HttpMethod method,
            String endpoint,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable);

    Page<RequestLogResponseDTO> getLogsByUser(UUID userId, Pageable pageable);

    Page<RequestLogResponseDTO> getRecentLogs(Pageable pageable);

    byte[] exportCsv(UUID userId, HttpMethod method, String endpoint, LocalDateTime startDate, LocalDateTime endDate);

    long clearAll();
}
