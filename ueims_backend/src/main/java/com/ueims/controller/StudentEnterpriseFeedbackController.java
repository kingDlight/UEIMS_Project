package com.ueims.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.service.StudentEnterpriseFeedbackService;
import com.ueims.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/student-enterprise-feedbacks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StudentEnterpriseFeedbackController {
    private final StudentEnterpriseFeedbackService service;
    private final com.ueims.mapper.StudentEnterpriseFeedbackMapper mapper;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<java.util.List<com.ueims.dto.response.StudentEnterpriseFeedbackDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-feedbacks")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<java.util.List<com.ueims.dto.response.StudentEnterpriseFeedbackDTO>> getMyFeedbacks() {
        return ResponseEntity.ok(service.findMyFeedbacks(userService.getCurrentUserId()).stream()
                .map(mapper::toDto)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.ueims.dto.response.StudentEnterpriseFeedbackDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<com.ueims.dto.response.StudentEnterpriseFeedbackDTO> create(
            @Valid @RequestBody com.ueims.dto.response.StudentEnterpriseFeedbackDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
