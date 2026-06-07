package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.EnterpriseEvaluation;
import com.ueims.service.EnterpriseEvaluationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/enterprise-evaluations")
@RequiredArgsConstructor
public class EnterpriseEvaluationController {
    private final EnterpriseEvaluationService service;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<EnterpriseEvaluation>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('ENTERPRISE') or hasRole('STUDENT')")
    public ResponseEntity<EnterpriseEvaluation> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ENTERPRISE')")
    public ResponseEntity<EnterpriseEvaluation> create(@Valid @RequestBody EnterpriseEvaluation entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
