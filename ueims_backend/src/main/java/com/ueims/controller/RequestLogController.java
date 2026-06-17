package com.ueims.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.response.ApiResponse;
import com.ueims.dto.response.RequestLogResponseDTO;
import com.ueims.model.entity.RequestLog.HttpMethod;
import com.ueims.service.RequestLogService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/request-logs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RequestLogController {

    RequestLogService service;

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ApiResponse<Long> clearAllLogs() {
        long deleted = service.clearAll();
        return ApiResponse.<Long>builder()
                .result(deleted)
                .message("Cleared " + deleted + " request log entries")
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ApiResponse<Page<RequestLogResponseDTO>> getLogs(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) HttpMethod method,
            @RequestParam(required = false) String endpoint,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        UUID userUuid = null;
        if (userId != null && !userId.isBlank()) {
            try {
                userUuid = UUID.fromString(userId);
            } catch (IllegalArgumentException ignored) {
            }
        }

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<RequestLogResponseDTO> result =
                service.searchLogs(userUuid, method, endpoint, startDateTime, endDateTime, pageable);

        return ApiResponse.<Page<RequestLogResponseDTO>>builder()
                .result(result)
                .message("Lấy danh sách request log thành công")
                .build();
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ApiResponse<Page<RequestLogResponseDTO>> getLogsByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        UUID userUuid = UUID.fromString(userId);
        Pageable pageable = PageRequest.of(page, size);
        Page<RequestLogResponseDTO> result = service.getLogsByUser(userUuid, pageable);

        return ApiResponse.<Page<RequestLogResponseDTO>>builder()
                .result(result)
                .message("Lấy request log theo user thành công")
                .build();
    }

    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ApiResponse<Page<RequestLogResponseDTO>> getRecentLogs(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<RequestLogResponseDTO> result = service.getRecentLogs(pageable);

        return ApiResponse.<Page<RequestLogResponseDTO>>builder()
                .result(result)
                .message("Lấy request log gần đây thành công")
                .build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) HttpMethod method,
            @RequestParam(required = false) String endpoint,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        UUID userUuid = null;
        if (userId != null && !userId.isBlank()) {
            try {
                userUuid = UUID.fromString(userId);
            } catch (IllegalArgumentException ignored) {
            }
        }

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        byte[] csvData = service.exportCsv(userUuid, method, endpoint, startDateTime, endDateTime);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "request_logs.csv");

        return ResponseEntity.ok().headers(headers).body(csvData);
    }
}
