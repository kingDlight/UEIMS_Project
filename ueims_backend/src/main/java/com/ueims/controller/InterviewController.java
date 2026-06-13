package com.ueims.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.service.InterviewService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InterviewController {
    InterviewService service;
    com.ueims.mapper.InterviewMapper mapper;

    @GetMapping
    public ResponseEntity<java.util.List<com.ueims.dto.response.InterviewDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-schedules")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<java.util.List<com.ueims.dto.response.InterviewDTO>> getMyInterviews() {
        return ResponseEntity.ok(
                service.findMyInterviews().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.ueims.dto.response.InterviewDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<com.ueims.dto.response.InterviewDTO> create(
            @Valid @RequestBody com.ueims.dto.response.InterviewDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/confirm")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<com.ueims.dto.response.InterviewDTO> confirm(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.confirmAttendance(id)));
    }

    @PostMapping("/{id}/decline")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<com.ueims.dto.response.InterviewDTO> decline(
            @PathVariable UUID id, @RequestParam("reason") String reason) {
        return ResponseEntity.ok(mapper.toDto(service.declineAttendance(id, reason)));
    }

    @PostMapping("/{id}/result")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ENTERPRISE')")
    public ResponseEntity<com.ueims.dto.response.InterviewDTO> recordResult(
            @PathVariable UUID id,
            @RequestParam("result") String result,
            @RequestParam(value = "feedback", required = false) String feedback) {
        return ResponseEntity.ok(mapper.toDto(service.recordResult(id, result, feedback)));
    }
}
