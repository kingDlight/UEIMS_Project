package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.Semester;
import com.ueims.service.SemesterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/semesters")
@RequiredArgsConstructor
public class SemesterController {
    private final SemesterService service;

    @GetMapping
    public ResponseEntity<List<Semester>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Semester> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<Semester> create(@RequestBody Semester entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/open")
    public ResponseEntity<Semester> openSemester(@PathVariable UUID id) {
        return ResponseEntity.ok(service.openSemester(id));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Semester> closeSemester(@PathVariable UUID id) {
        return ResponseEntity.ok(service.closeSemester(id));
    }
}
