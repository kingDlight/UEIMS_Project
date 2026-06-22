package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.SemesterCreationRequest;
import com.ueims.dto.response.SemesterResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.UserRepository;
import com.ueims.service.SemesterService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/semesters")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SemesterController {
    SemesterService service;
    UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<SemesterResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "startDate") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDirection) {

        org.springframework.data.domain.Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? org.springframework.data.domain.Sort.Direction.ASC
                : org.springframework.data.domain.Sort.Direction.DESC;
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                direction, (sortBy != null && !sortBy.trim().isEmpty()) ? sortBy : "startDate");

        return ResponseEntity.ok(service.findAll(status, sort).stream()
                .map(SemesterResponse::fromEntity)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SemesterResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(SemesterResponse.fromEntity(service.findById(id)));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize(
            "hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<SemesterResponse> create(@Valid @RequestBody SemesterCreationRequest request) {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Semester entity = Semester.builder()
                .semesterCode(request.getSemesterCode())
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .weeklyReportDeadlineDay(
                        request.getWeeklyReportDeadlineDay() != null ? request.getWeeklyReportDeadlineDay() : "SUNDAY")
                .weeklyReportDeadlineTime(request.getWeeklyReportDeadlineTime())
                .status("DRAFT") // BR: New semesters must always start as DRAFT
                .createdBy(user)
                .build();

        return ResponseEntity.ok(SemesterResponse.fromEntity(service.save(entity)));
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize(
            "hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<SemesterResponse> update(
            @PathVariable UUID id, @Valid @RequestBody SemesterCreationRequest request) {
        Semester existing = service.findById(id);
        if (existing == null) {
            throw new AppException(ErrorCode.SEMESTER_NOT_FOUND);
        }
        // Only allow editing Name/Code for ACTIVE semesters; dates are still enforced by service.
        existing.setName(request.getName());
        existing.setSemesterCode(request.getSemesterCode());
        existing.setStartDate(request.getStartDate());
        existing.setEndDate(request.getEndDate());
        if (request.getWeeklyReportDeadlineDay() != null) {
            existing.setWeeklyReportDeadlineDay(request.getWeeklyReportDeadlineDay());
        }
        if (request.getWeeklyReportDeadlineTime() != null) {
            existing.setWeeklyReportDeadlineTime(request.getWeeklyReportDeadlineTime());
        }
        return ResponseEntity.ok(SemesterResponse.fromEntity(service.save(existing)));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize(
            "hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/open")
    @org.springframework.security.access.prepost.PreAuthorize(
            "hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<SemesterResponse> openSemester(@PathVariable UUID id) {
        return ResponseEntity.ok(SemesterResponse.fromEntity(service.openSemester(id)));
    }

    @PutMapping("/{id}/active")
    @org.springframework.security.access.prepost.PreAuthorize(
            "hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<SemesterResponse> activeSemester(@PathVariable UUID id) {
        return ResponseEntity.ok(SemesterResponse.fromEntity(service.activeSemester(id)));
    }

    @PutMapping("/{id}/close")
    @org.springframework.security.access.prepost.PreAuthorize(
            "hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<SemesterResponse> closeSemester(@PathVariable UUID id) {
        return ResponseEntity.ok(SemesterResponse.fromEntity(service.closeSemester(id)));
    }

    @PutMapping("/{id}/lock")
    @org.springframework.security.access.prepost.PreAuthorize(
            "hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<SemesterResponse> lockSemester(@PathVariable UUID id) {
        return ResponseEntity.ok(SemesterResponse.fromEntity(service.lockSemester(id)));
    }
}
