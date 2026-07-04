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
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<List<WeeklyReportDTO>> getAll() {
        return ResponseEntity.ok(service.findAllDtos());
    }

    @GetMapping("/my-reports")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<WeeklyReportDTO>> getMyReports() {
        return ResponseEntity.ok(service.findMyReportsDtos());
    }

    @GetMapping("/by-enterprise")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<List<WeeklyReportDTO>> getByEnterprise() {
        return ResponseEntity.ok(service.findByEnterprise());
    }

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasRole('STUDENT') or hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<WeeklyReportDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findByIdDto(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<WeeklyReportDTO> create(@Valid @RequestBody WeeklyReportDTO dto) {
        com.ueims.model.entity.WeeklyReport entity = mapper.toEntity(dto);
        if (dto.getAssignmentId() != null) {
            com.ueims.model.entity.EnterpriseAssignment assignment = new com.ueims.model.entity.EnterpriseAssignment();
            assignment.setAssignmentId(dto.getAssignmentId());
            entity.setAssignment(assignment);
        }
        // Sanitize rich-text HTML fields before saving
        if (entity.getTasksCompleted() != null)
            entity.setTasksCompleted(HtmlSanitizer.sanitize(entity.getTasksCompleted()));
        if (entity.getIssuesChallenges() != null)
            entity.setIssuesChallenges(HtmlSanitizer.sanitize(entity.getIssuesChallenges()));
        if (entity.getLessonsLearned() != null)
            entity.setLessonsLearned(HtmlSanitizer.sanitize(entity.getLessonsLearned()));
        if (entity.getPlanNextWeek() != null) entity.setPlanNextWeek(HtmlSanitizer.sanitize(entity.getPlanNextWeek()));

        return ResponseEntity.ok(service.saveAndEnrich(entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<WeeklyReportDTO> update(
            @PathVariable UUID id, @Valid @RequestBody WeeklyReportRequest request) {
        return ResponseEntity.ok(service.updateReportAndEnrich(id, request));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<WeeklyReportDTO> approve(
            @PathVariable UUID id, @RequestBody(required = false) WeeklyReportRequest feedback) {
        String fb = feedback == null ? null : feedback.getFeedback();
        return ResponseEntity.ok(service.approveReportAndEnrich(id, fb));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<WeeklyReportDTO> reject(@PathVariable UUID id, @RequestBody WeeklyReportRequest request) {
        if (request == null
                || request.getFeedback() == null
                || request.getFeedback().isBlank()) {
            throw new com.ueims.exception.AppException(com.ueims.exception.ErrorCode.FIELD_REQUIRED);
        }
        return ResponseEntity.ok(service.rejectReportAndEnrich(id, request.getFeedback()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
