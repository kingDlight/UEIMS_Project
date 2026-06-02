package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.Interview;
import com.ueims.service.InterviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {
    private final InterviewService service;

    @GetMapping
    public ResponseEntity<List<Interview>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interview> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<Interview> create(@Valid @RequestBody Interview entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/student-confirm")
    public ResponseEntity<Interview> studentConfirm(@PathVariable UUID id) {
        return ResponseEntity.ok(service.studentConfirm(id));
    }

    @PostMapping("/{id}/student-decline")
    public ResponseEntity<Interview> studentDecline(@PathVariable UUID id, @RequestParam("reason") String reason) {
        return ResponseEntity.ok(service.studentDecline(id, reason));
    }

    @PostMapping("/{id}/decide")
    public ResponseEntity<Interview> decide(@PathVariable UUID id,
                                            @RequestBody com.ueims.dto.request.InterviewDecisionRequest req) {
        return ResponseEntity.ok(service.decideInterview(id, req.getResult(), req.getDecidedBy()));
    }
}
