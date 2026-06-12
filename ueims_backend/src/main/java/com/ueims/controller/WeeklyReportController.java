package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.request.WeeklyReportRequest;
import com.ueims.dto.response.WeeklyReportDTO;
import com.ueims.mapper.WeeklyReportMapper;
import com.ueims.service.WeeklyReportService;
import com.ueims.util.HtmlSanitizer;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/weekly-reports")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WeeklyReportController {
    WeeklyReportService service;
    WeeklyReportMapper mapper;

    @GetMapping
    public ResponseEntity<List<WeeklyReportDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-reports")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<WeeklyReportDTO>> getMyReports() {
        return ResponseEntity.ok(
                service.findMyReports().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeeklyReportDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<WeeklyReportDTO> create(@Valid @RequestBody WeeklyReportDTO entity) {
        // Sanitize rich-text HTML fields before saving
        if (entity.getTasksCompleted() != null)
            entity.setTasksCompleted(HtmlSanitizer.sanitize(entity.getTasksCompleted()));
        if (entity.getIssuesChallenges() != null)
            entity.setIssuesChallenges(HtmlSanitizer.sanitize(entity.getIssuesChallenges()));
        if (entity.getLessonsLearned() != null)
            entity.setLessonsLearned(HtmlSanitizer.sanitize(entity.getLessonsLearned()));
        if (entity.getPlanNextWeek() != null) entity.setPlanNextWeek(HtmlSanitizer.sanitize(entity.getPlanNextWeek()));
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<WeeklyReportDTO> update(
            @PathVariable UUID id, @Valid @RequestBody WeeklyReportRequest request) {
        return ResponseEntity.ok(mapper.toDto(service.updateReport(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
