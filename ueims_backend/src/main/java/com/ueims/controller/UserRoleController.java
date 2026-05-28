package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.UserRole;
import com.ueims.service.UserRoleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users-roles")
@RequiredArgsConstructor
public class UserRoleController {
    private final UserRoleService service;

    @GetMapping
    public ResponseEntity<List<UserRole>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserRole> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<UserRole> create(@RequestBody UserRole entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
