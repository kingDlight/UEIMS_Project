package com.ueims.controller;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.InternshipPlan;
import com.ueims.service.InternshipPlanService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/internship-plans")
@RequiredArgsConstructor
public class InternshipPlanController {
    private final InternshipPlanService service;

    @GetMapping
    public ResponseEntity<List<InternshipPlan>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternshipPlan> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<InternshipPlan> create(@Valid @RequestBody InternshipPlan entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}