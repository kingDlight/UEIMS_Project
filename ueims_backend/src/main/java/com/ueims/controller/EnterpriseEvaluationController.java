package com.ueims.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.service.EnterpriseEvaluationService;
import com.ueims.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/enterprise-evaluations")
@RequiredArgsConstructor
public class EnterpriseEvaluationController {
    private final EnterpriseEvaluationService service;
    private final com.ueims.mapper.EnterpriseEvaluationMapper mapper;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<java.util.List<com.ueims.dto.response.EnterpriseEvaluationDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-evaluation")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyEvaluation() {
        var evaluation = service.findMyEvaluation(userService.getCurrentUserId());
        if (evaluation == null) {
            return ResponseEntity.ok(java.util.Map.of("result", java.util.Map.of()));
        }
        return ResponseEntity.ok(java.util.Map.of("result", mapper.toDto(evaluation)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('ENTERPRISE') or hasRole('STUDENT')")
    public ResponseEntity<com.ueims.dto.response.EnterpriseEvaluationDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ENTERPRISE')")
    public ResponseEntity<com.ueims.dto.response.EnterpriseEvaluationDTO> create(
            @Valid @RequestBody com.ueims.dto.response.EnterpriseEvaluationDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
