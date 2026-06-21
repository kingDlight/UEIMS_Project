package com.ueims.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.response.ApiResponse;
import com.ueims.dto.response.AuditLogResponseDTO;
import com.ueims.service.AuditLogService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuditLogController {
    AuditLogService service;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ApiResponse<List<AuditLogResponseDTO>> getAll() {
        return ApiResponse.<List<AuditLogResponseDTO>>builder()
                .result(service.findAll())
                .message("Lấy danh sách audit log thành công")
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ApiResponse<AuditLogResponseDTO> getById(@PathVariable UUID id) {
        return ApiResponse.<AuditLogResponseDTO>builder()
                .result(service.findById(id))
                .message("Lấy chi tiết audit log thành công")
                .build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String action) {

        byte[] excelData = service.exportExcel(startDate, endDate, action);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "audit_logs.xlsx");

        return ResponseEntity.ok().headers(headers).body(excelData);
    }
}
