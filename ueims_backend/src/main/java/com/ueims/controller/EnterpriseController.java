package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.EnterpriseApprovalRequest;
import com.ueims.model.entity.Enterprise;
import com.ueims.service.EnterpriseService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/enterprises")
@RequiredArgsConstructor
public class EnterpriseController {
    private final EnterpriseService service;

    @GetMapping
    public ResponseEntity<List<Enterprise>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enterprise> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<Enterprise> create(@Valid @RequestBody Enterprise entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Enterprise> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(service.approve(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Enterprise> reject(
            @PathVariable UUID id, @Valid @RequestBody EnterpriseApprovalRequest request) {
        return ResponseEntity.ok(service.reject(id, request.getRejectionReason()));
    }
}
