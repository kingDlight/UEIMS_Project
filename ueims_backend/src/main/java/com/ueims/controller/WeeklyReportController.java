package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<WeeklyReport> update(@PathVariable UUID id, @Valid @RequestBody com.ueims.dto.request.WeeklyReportRequest req) {
        WeeklyReport existing = service.findById(id);
        if (existing == null) return ResponseEntity.notFound().build();
        // Map fields
        if (req.getTasksCompleted() != null) existing.setTasksCompleted(req.getTasksCompleted());
        if (req.getIssuesChallenges() != null) existing.setIssuesChallenges(req.getIssuesChallenges());
        if (req.getLessonsLearned() != null) existing.setLessonsLearned(req.getLessonsLearned());
        if (req.getPlanNextWeek() != null) existing.setPlanNextWeek(req.getPlanNextWeek());
        if (req.getAttachmentUrls() != null) existing.setAttachmentUrls(req.getAttachmentUrls());
        if (req.getStatus() != null) existing.setStatus(req.getStatus());
        return ResponseEntity.ok(service.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
