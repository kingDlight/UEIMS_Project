package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.Incident;
import com.ueims.service.IncidentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {
    private final IncidentService service;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<Incident>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Incident> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Incident> create(@Valid @RequestBody com.ueims.dto.request.IncidentRequest request) {
        return ResponseEntity.ok(service.createIncident(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Incident> update(
            @PathVariable UUID id, @Valid @RequestBody com.ueims.dto.request.IncidentRequest request) {
        return ResponseEntity.ok(service.updateIncident(id, request));
    }

    @PostMapping("/report")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ENTERPRISE')")
    public ResponseEntity<Incident> reportIncident(
            @Valid @RequestBody com.ueims.dto.request.IncidentReportRequest request) {
        return ResponseEntity.ok(service.reportIncident(request));
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public ResponseEntity<Incident> resolveIncident(
            @PathVariable UUID id, @Valid @RequestBody com.ueims.dto.request.IncidentResolveRequest request) {
        return ResponseEntity.ok(service.resolveIncident(id, request));
    }
}
