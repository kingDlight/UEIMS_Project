package com.ueims.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.service.EnterpriseAssignmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/enterprise-assignments")
@RequiredArgsConstructor
public class EnterpriseAssignmentController {
    private final EnterpriseAssignmentService service;
    private final com.ueims.mapper.EnterpriseAssignmentMapper mapper;

    @GetMapping
    public ResponseEntity<java.util.List<com.ueims.dto.response.EnterpriseAssignmentDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
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
