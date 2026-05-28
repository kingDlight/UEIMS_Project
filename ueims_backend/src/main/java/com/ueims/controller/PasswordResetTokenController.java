package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.PasswordResetToken;
import com.ueims.service.PasswordResetTokenService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/password-reset-tokens")
@RequiredArgsConstructor
public class PasswordResetTokenController {
    private final PasswordResetTokenService service;

    @GetMapping
    public ResponseEntity<List<PasswordResetToken>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PasswordResetToken> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<PasswordResetToken> create(@RequestBody PasswordResetToken entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
