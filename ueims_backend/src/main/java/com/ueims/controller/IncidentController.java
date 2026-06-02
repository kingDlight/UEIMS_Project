package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<Incident>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<Incident> create(@Valid @RequestBody Incident entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/report")
    public ResponseEntity<Incident> reportIncident(
            @Valid @RequestBody com.ueims.dto.request.IncidentReportRequest request) {
        return ResponseEntity.ok(service.reportIncident(request));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Incident> resolveIncident(
            @PathVariable UUID id, @Valid @RequestBody com.ueims.dto.request.IncidentResolveRequest request) {
        return ResponseEntity.ok(service.resolveIncident(id, request));
    }
}
