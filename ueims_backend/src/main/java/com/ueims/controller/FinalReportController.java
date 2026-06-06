package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.model.entity.FinalReport;
import com.ueims.service.FinalReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/final-reports")
@RequiredArgsConstructor
public class FinalReportController {
    private final FinalReportService service;

    @GetMapping
    public ResponseEntity<List<FinalReport>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FinalReport> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<FinalReport> create(@Valid @RequestBody FinalReport entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PostMapping("/upload")
    public ResponseEntity<FinalReport> uploadFinalReport(
            @RequestParam("assignmentId") UUID assignmentId, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadFinalReport(assignmentId, file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
