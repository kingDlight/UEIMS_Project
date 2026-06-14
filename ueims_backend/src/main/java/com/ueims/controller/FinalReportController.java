package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.service.FinalReportService;
import com.ueims.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/final-reports")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FinalReportController {
    private final FinalReportService service;
    private final com.ueims.mapper.FinalReportMapper mapper;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<com.ueims.dto.response.FinalReportDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-report")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<com.ueims.dto.response.FinalReportDTO> getMyReport() {
        return ResponseEntity.ok(mapper.toDto(service.findMyReport(userService.getCurrentUserId())));
    }

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasRole('STUDENT') or hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<com.ueims.dto.response.FinalReportDTO> getById(@PathVariable UUID id) {
        com.ueims.model.entity.FinalReport report = service.findById(id);
        if (report == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapper.toDto(report));
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<com.ueims.dto.response.FinalReportDTO> create(
            @Valid @RequestBody com.ueims.dto.response.FinalReportDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<com.ueims.dto.response.FinalReportDTO> uploadFinalReport(
            @RequestParam("assignmentId") UUID assignmentId, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(mapper.toDto(service.uploadFinalReport(assignmentId, file)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
