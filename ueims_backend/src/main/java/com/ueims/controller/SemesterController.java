package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.SemesterCreationRequest;
import com.ueims.dto.response.SemesterResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.UserRepository;
import com.ueims.service.SemesterService;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/semesters")
@RequiredArgsConstructor
public class SemesterController {
    private final SemesterService service;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<SemesterResponse>> getAll() {
        return ResponseEntity.ok(
                service.findAll().stream().map(SemesterResponse::fromEntity).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SemesterResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(SemesterResponse.fromEntity(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<SemesterResponse> create(@Valid @RequestBody SemesterCreationRequest request) {
        System.out.println("request: " + request);
        log.info("info request: ", request);
        
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
                .status(request.getStatus() != null ? request.getStatus() : "DRAFT")
                .createdBy(user)
                .build();

        return ResponseEntity.ok(SemesterResponse.fromEntity(service.save(entity)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/open")
    public ResponseEntity<SemesterResponse> openSemester(@PathVariable UUID id) {
        return ResponseEntity.ok(SemesterResponse.fromEntity(service.openSemester(id)));
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<SemesterResponse> activeSemester(@PathVariable UUID id) {
        return ResponseEntity.ok(SemesterResponse.fromEntity(service.activeSemester(id)));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<SemesterResponse> closeSemester(@PathVariable UUID id) {
        return ResponseEntity.ok(SemesterResponse.fromEntity(service.closeSemester(id)));
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<SemesterResponse> lockSemester(@PathVariable UUID id) {
        return ResponseEntity.ok(SemesterResponse.fromEntity(service.lockSemester(id)));
    }
}
