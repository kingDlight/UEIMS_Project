package com.ueims.controller;

import java.time.LocalDateTime;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.response.InterviewDTO;
import com.ueims.model.entity.Application;
import com.ueims.model.entity.Interview;
import com.ueims.service.InterviewService;
import com.ueims.service.MailService;
import com.ueims.service.NotificationService;

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
    MailService mailService;
    NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<InterviewDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-schedules")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<InterviewDTO>> getMyInterviews() {
        return ResponseEntity.ok(
                service.findMyInterviews().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-enterprise")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<List<InterviewDTO>> getMyEnterpriseInterviews() {
        return ResponseEntity.ok(
                service.findMyEnterpriseInterviews().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<InterviewDTO> create(@Valid @RequestBody InterviewDTO dto) {
        System.out.println("RECEIVED DTO: " + dto);
        System.out.println("RECEIVED scheduledTime: " + dto.getScheduledTime());
        System.out.println("RECEIVED applicationId: " + dto.getApplicationId());

        Interview entity = mapper.toEntity(dto);
        System.out.println("MAPPED scheduledTime: " + entity.getScheduledTime());

        if (dto.getApplicationId() != null) {
            Application app = new Application();
            app.setApplicationId(dto.getApplicationId());
            entity.setApplication(app);
        }
        return ResponseEntity.ok(mapper.toDto(service.save(entity)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<InterviewDTO> update(@PathVariable UUID id, @Valid @RequestBody InterviewDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.update(id, entity)));
    }

    @PostMapping("/{id}/record-result")
    @PreAuthorize("hasRole('ENTERPRISE')")
    public ResponseEntity<InterviewDTO> recordResult(
            @PathVariable UUID id, @RequestParam String result, @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(mapper.toDto(service.recordResult(id, result, notes)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<InterviewDTO> confirm(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.confirmAttendance(id)));
    }

    @PostMapping("/{id}/decline")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<InterviewDTO> decline(@PathVariable UUID id, @RequestParam("reason") String reason) {
        return ResponseEntity.ok(mapper.toDto(service.declineAttendance(id, reason)));
    }

    // UC-43.3: Cancel interview with a reason
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<InterviewDTO> cancel(@PathVariable UUID id, @RequestParam("reason") String reason) {
        return ResponseEntity.ok(mapper.toDto(service.cancel(id, reason)));
    }

    // UC-43.2: Reschedule interview
    @PostMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<InterviewDTO> reschedule(
            @PathVariable UUID id,
            @RequestParam("newTime") String newTime,
            @RequestParam(value = "reason", required = false) String reason,
            @RequestParam(value = "meetingLink", required = false) String meetingLink,
            @RequestParam(value = "location", required = false) String location) {

        LocalDateTime parsedTime;
        if (newTime.endsWith("Z")) {
            parsedTime = java.time.Instant.parse(newTime)
                    .atZone(java.time.ZoneId.of("UTC"))
                    .toLocalDateTime();
        } else {
            parsedTime = LocalDateTime.parse(newTime);
        }

        return ResponseEntity.ok(mapper.toDto(service.reschedule(id, parsedTime, reason, meetingLink, location)));
    }

    // UC-43.1: Propose 3 open slots for a given application
    @GetMapping("/propose-slots")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<List<String>> proposeSlots(@RequestParam("applicationId") UUID applicationId) {
        return ResponseEntity.ok(service.proposeSlots(applicationId).stream()
                .map(LocalDateTime::toString)
                .toList());
    }
}
