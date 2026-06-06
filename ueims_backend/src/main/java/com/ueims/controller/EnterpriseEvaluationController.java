package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.EnterpriseEvaluation;
import com.ueims.service.EnterpriseEvaluationService;

import lombok.RequiredArgsConstructor;

@SuppressWarnings("java:S4684")
@RestController
@RequestMapping("/api/enterprise-evaluations")
@RequiredArgsConstructor
public class EnterpriseEvaluationController {
    private final EnterpriseEvaluationService service;

    @GetMapping
    public ResponseEntity<List<EnterpriseEvaluation>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnterpriseEvaluation> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<EnterpriseEvaluation> create(@Valid @RequestBody EnterpriseEvaluation entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
