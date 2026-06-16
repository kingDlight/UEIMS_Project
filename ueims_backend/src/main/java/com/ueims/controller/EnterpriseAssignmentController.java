package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.response.EnterpriseAssignmentResponseDTO;
import com.ueims.service.EnterpriseAssignmentService;
import com.ueims.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/enterprise-assignments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EnterpriseAssignmentController {
    private final EnterpriseAssignmentService service;
    private final com.ueims.mapper.EnterpriseAssignmentMapper mapper;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<EnterpriseAssignmentResponseDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-enterprise")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<List<EnterpriseAssignmentResponseDTO>> getMyEnterpriseAssignments(
            @RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ResponseEntity.ok(service.searchMyEnterpriseAssignments(keyword.trim()).stream()
                    .map(mapper::toDto)
                    .toList());
        }
        return ResponseEntity.ok(service.findMyEnterpriseAssignments().stream()
                .map(mapper::toDto)
                .toList());
    }

    @GetMapping("/my-assignment")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnterpriseAssignmentResponseDTO> getMyAssignment() {
        return ResponseEntity.ok(mapper.toDto(service.findMyAssignment(userService.getCurrentUserId())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('ENTERPRISE') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<EnterpriseAssignmentResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<EnterpriseAssignmentResponseDTO> create(
            @Valid @RequestBody EnterpriseAssignmentResponseDTO dto) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(dto))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<EnterpriseAssignmentResponseDTO> update(
            @PathVariable UUID id, @RequestBody EnterpriseAssignmentResponseDTO dto) {
        return ResponseEntity.ok(mapper.toDto(service.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
