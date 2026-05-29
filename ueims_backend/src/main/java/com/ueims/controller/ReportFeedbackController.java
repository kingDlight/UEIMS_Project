package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.ReportFeedback;
import com.ueims.service.ReportFeedbackService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/report-feedbacks")
@RequiredArgsConstructor
public class ReportFeedbackController {
    private final ReportFeedbackService service;

    @GetMapping
    public ResponseEntity<List<ReportFeedback>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportFeedback> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ReportFeedback> create(@Valid @RequestBody ReportFeedback entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
