package com.ueims.controller;

import com.ueims.model.entity.EligibleStudent;
import com.ueims.service.EligibleStudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/eligible-students")
@RequiredArgsConstructor
public class EligibleStudentController {
    private final EligibleStudentService service;

    @GetMapping
    public ResponseEntity<List<EligibleStudent>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EligibleStudent> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<EligibleStudent> create(@RequestBody EligibleStudent entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
