package com.ueims.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.InvalidatedToken;
import com.ueims.service.InvalidatedTokenService;

import lombok.RequiredArgsConstructor;

@SuppressWarnings("java:S4684")
@RestController
@RequestMapping("/api/invalidated-tokens")
@RequiredArgsConstructor
public class InvalidatedTokenController {
    private final InvalidatedTokenService service;

    @GetMapping
    public ResponseEntity<List<InvalidatedToken>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvalidatedToken> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<InvalidatedToken> create(@Valid @RequestBody InvalidatedToken entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
