package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.request.WeeklyReportRequest;
import com.ueims.model.entity.WeeklyReport;
import com.ueims.service.WeeklyReportService;

import jakarta.validation.Valid;
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

    @GetMapping("/my-reports")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<WeeklyReport>> getMyReports() {
        return ResponseEntity.ok(service.findMyReports());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeeklyReport> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<WeeklyReport> create(@Valid @RequestBody WeeklyReport entity) {
        // Sanitize rich-text HTML fields before saving
        if (entity.getTasksCompleted() != null)
            entity.setTasksCompleted(com.ueims.util.HtmlSanitizer.sanitize(entity.getTasksCompleted()));
        if (entity.getIssuesChallenges() != null)
            entity.setIssuesChallenges(com.ueims.util.HtmlSanitizer.sanitize(entity.getIssuesChallenges()));
        if (entity.getLessonsLearned() != null)
            entity.setLessonsLearned(com.ueims.util.HtmlSanitizer.sanitize(entity.getLessonsLearned()));
        if (entity.getPlanNextWeek() != null)
            entity.setPlanNextWeek(com.ueims.util.HtmlSanitizer.sanitize(entity.getPlanNextWeek()));
        return ResponseEntity.ok(service.save(entity));
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<WeeklyReport> update(@PathVariable UUID id, @Valid @RequestBody WeeklyReportRequest request) {
        return ResponseEntity.ok(service.updateReport(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
