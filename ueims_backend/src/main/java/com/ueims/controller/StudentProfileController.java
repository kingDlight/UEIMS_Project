package com.ueims.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.request.StudentProfileUpdateRequest;
import com.ueims.service.StudentProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student-profiles")
@RequiredArgsConstructor
public class StudentProfileController {
    private final StudentProfileService service;
    private final com.ueims.mapper.StudentProfileMapper mapper;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<java.util.List<com.ueims.dto.response.StudentProfileDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasRole('STUDENT') or hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<com.ueims.dto.response.StudentProfileDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<com.ueims.dto.response.StudentProfileDTO> create(
            @Valid @RequestBody com.ueims.dto.response.StudentProfileDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<com.ueims.dto.response.StudentProfileDTO> update(
            @PathVariable UUID id, @Valid @RequestBody StudentProfileUpdateRequest request) {
        return ResponseEntity.ok(mapper.toDto(service.updateProfile(id, request)));
    }

    @PostMapping("/{id}/upload-cv")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<com.ueims.dto.response.StudentProfileDTO> uploadCv(
            @PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(mapper.toDto(service.uploadCv(id, file)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
