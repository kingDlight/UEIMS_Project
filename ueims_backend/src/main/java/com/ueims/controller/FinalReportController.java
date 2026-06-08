package com.ueims.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.service.FinalReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/final-reports")
@RequiredArgsConstructor
public class FinalReportController {
    private final FinalReportService service;
    private final com.ueims.mapper.FinalReportMapper mapper;

    @GetMapping
    public ResponseEntity<java.util.List<com.ueims.dto.response.FinalReportDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.ueims.dto.response.FinalReportDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<com.ueims.dto.response.FinalReportDTO> create(
            @Valid @RequestBody com.ueims.dto.response.FinalReportDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @PostMapping("/upload")
    public ResponseEntity<com.ueims.dto.response.FinalReportDTO> uploadFinalReport(
            @RequestParam("assignmentId") UUID assignmentId, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(mapper.toDto(service.uploadFinalReport(assignmentId, file)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
