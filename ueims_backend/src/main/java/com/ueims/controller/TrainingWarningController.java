package com.ueims.controller;

import com.ueims.model.entity.TrainingWarning;
import com.ueims.service.TrainingWarningService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/training-warnings")
@RequiredArgsConstructor
public class TrainingWarningController {
    private final TrainingWarningService service;

    @GetMapping
    public ResponseEntity<List<TrainingWarning>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingWarning> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<TrainingWarning> create(@RequestBody TrainingWarning entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
