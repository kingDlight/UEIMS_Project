package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.WeeklyReportRequest;
import com.ueims.model.entity.WeeklyReport;
import com.ueims.service.WeeklyReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/weekly-reports")
@RequiredArgsConstructor
public class WeeklyReportController {
    private final WeeklyReportService service;

    @GetMapping
    public ResponseEntity<List<WeeklyReport>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeeklyReport> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<WeeklyReport> create(@Valid @RequestBody WeeklyReport entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WeeklyReport> update(@PathVariable UUID id, @Valid @RequestBody WeeklyReportRequest request) {
        return ResponseEntity.ok(service.updateReport(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
