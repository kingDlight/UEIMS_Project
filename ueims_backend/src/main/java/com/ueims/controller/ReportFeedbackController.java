package com.ueims.controller;

import com.ueims.model.entity.ReportFeedback;
import com.ueims.service.ReportFeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

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
    public ResponseEntity<ReportFeedback> create(@RequestBody ReportFeedback entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
