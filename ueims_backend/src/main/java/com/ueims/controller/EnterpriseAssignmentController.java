package com.ueims.controller;

import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.service.EnterpriseAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

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
    public ResponseEntity<EnterpriseAssignment> create(@RequestBody EnterpriseAssignment entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
