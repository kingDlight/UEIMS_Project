package com.ueims.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.response.RequestLogResponseDTO;
import com.ueims.model.entity.RequestLog;
import com.ueims.model.entity.RequestLog.HttpMethod;
import com.ueims.repository.RequestLogRepository;
import com.ueims.service.RequestLogService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RequestLogServiceImpl implements RequestLogService {

    RequestLogRepository repository;

    private static final DateTimeFormatter CSV_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    @Async
    @Transactional
    public void logRequest(RequestLog requestLog) {
        try {
            repository.save(requestLog);
        } catch (Exception e) {
            log.error(
                    "Failed to save request log: {} {} -> {}",
                    requestLog.getMethod(),
                    requestLog.getEndpoint(),
                    e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RequestLogResponseDTO> searchLogs(
            UUID userId,
            HttpMethod method,
            String endpoint,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {
        return repository
                .searchLogs(userId, method, endpoint, startDate, endDate, pageable)
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RequestLogResponseDTO> getLogsByUser(UUID userId, Pageable pageable) {
        return repository.findByUserId(userId, pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RequestLogResponseDTO> getRecentLogs(Pageable pageable) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        return repository.findByTimestampAfter(cutoff, pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportCsv(
            UUID userId, HttpMethod method, String endpoint, LocalDateTime startDate, LocalDateTime endDate) {
        Page<RequestLog> logs = repository.searchLogs(userId, method, endpoint, startDate, endDate, Pageable.unpaged());

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
                PrintWriter writer = new PrintWriter(out)) {
            writer.println(
                    "ID,Timestamp,User Email,HTTP Method,Endpoint,Status Code,IP Address,Response Time (ms),User Agent");

            logs.forEach(log -> writer.println(String.join(
                    ",",
                    log.getId() != null ? log.getId().toString() : "",
                    log.getTimestamp() != null ? log.getTimestamp().format(CSV_DATE_FORMAT) : "",
                    escape(log.getUserEmail()),
                    log.getMethod() != null ? log.getMethod().name() : "",
                    escape(log.getEndpoint()),
                    log.getStatusCode() != null ? log.getStatusCode().toString() : "",
                    escape(log.getIpAddress()),
                    log.getResponseTimeMs() != null ? log.getResponseTimeMs().toString() : "",
                    escape(log.getUserAgent()))));

            writer.flush();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to export request logs CSV", e);
            return new byte[0];
        }
    }

    private RequestLogResponseDTO toDto(RequestLog log) {
        return RequestLogResponseDTO.builder()
                .id(log.getId())
                .userId(log.getUserId() != null ? log.getUserId().toString() : null)
                .userEmail(log.getUserEmail())
                .sessionId(log.getSessionId())
                .method(log.getMethod())
                .endpoint(log.getEndpoint())
                .statusCode(log.getStatusCode())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .responseTimeMs(log.getResponseTimeMs())
                .timestamp(log.getTimestamp())
                .build();
    }

    private String escape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
