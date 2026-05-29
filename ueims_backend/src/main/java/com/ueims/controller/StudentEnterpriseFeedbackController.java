package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.StudentEnterpriseFeedback;
import com.ueims.service.StudentEnterpriseFeedbackService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student-enterprise-feedbacks")
@RequiredArgsConstructor
public class StudentEnterpriseFeedbackController {
    private final StudentEnterpriseFeedbackService service;

    @GetMapping
    public ResponseEntity<List<StudentEnterpriseFeedback>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentEnterpriseFeedback> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<StudentEnterpriseFeedback> create(@Valid @RequestBody StudentEnterpriseFeedback entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
