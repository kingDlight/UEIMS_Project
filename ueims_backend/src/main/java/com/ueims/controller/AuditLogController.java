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

import com.ueims.model.entity.AuditLog;
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
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<AuditLog>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<AuditLog> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        byte[] excelData = service.exportExcel(startDate, endDate);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "audit_logs.xlsx");

        return ResponseEntity.ok().headers(headers).body(excelData);
    }
}
