package com.ueims.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.service.ReportFeedbackService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/report-feedbacks")
@RequiredArgsConstructor
public class ReportFeedbackController {
    private final ReportFeedbackService service;
    private final com.ueims.mapper.ReportFeedbackMapper mapper;

    @GetMapping
    public ResponseEntity<java.util.List<com.ueims.dto.response.ReportFeedbackDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.ueims.dto.response.ReportFeedbackDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<com.ueims.dto.response.ReportFeedbackDTO> create(
            @Valid @RequestBody com.ueims.dto.response.ReportFeedbackDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
