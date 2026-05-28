package com.ueims.controller;

import com.ueims.model.entity.SemesterEnterprise;
import com.ueims.service.SemesterEnterpriseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/semester-enterprises")
@RequiredArgsConstructor
public class SemesterEnterpriseController {
    private final SemesterEnterpriseService service;

    @GetMapping
    public ResponseEntity<List<SemesterEnterprise>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SemesterEnterprise> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<SemesterEnterprise> create(@RequestBody SemesterEnterprise entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
