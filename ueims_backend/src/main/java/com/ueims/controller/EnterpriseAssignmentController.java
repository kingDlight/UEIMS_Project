package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.service.EnterpriseAssignmentService;

import lombok.RequiredArgsConstructor;

@SuppressWarnings("java:S4684")
@RestController
@RequestMapping("/api/enterprise-assignments")
@RequiredArgsConstructor
public class EnterpriseAssignmentController {
    private final EnterpriseAssignmentService service;

    @GetMapping
    public ResponseEntity<List<EnterpriseAssignment>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnterpriseAssignment> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<EnterpriseAssignment> create(@Valid @RequestBody EnterpriseAssignment entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
