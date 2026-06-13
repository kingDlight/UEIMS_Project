package com.ueims.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.service.InvalidatedTokenService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/invalidated-tokens")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InvalidatedTokenController {
    InvalidatedTokenService service;
    com.ueims.mapper.InvalidatedTokenMapper mapper;

    @GetMapping
    public ResponseEntity<java.util.List<com.ueims.dto.response.InvalidatedTokenDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.ueims.dto.response.InvalidatedTokenDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<com.ueims.dto.response.InvalidatedTokenDTO> create(
            @Valid @RequestBody com.ueims.dto.response.InvalidatedTokenDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
