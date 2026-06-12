package com.ueims.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<java.util.List<com.ueims.dto.response.EnterpriseAssignmentDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-assignment")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<com.ueims.dto.response.EnterpriseAssignmentDTO> getMyAssignment() {
        return ResponseEntity.ok(mapper.toDto(service.findMyAssignment(userService.getCurrentUserId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.ueims.dto.response.EnterpriseAssignmentDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<com.ueims.dto.response.EnterpriseAssignmentDTO> create(
            @Valid @RequestBody com.ueims.dto.response.EnterpriseAssignmentDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
