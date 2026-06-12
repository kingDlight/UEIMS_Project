package com.ueims.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.request.StudentProfileUpdateRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.service.StudentProfileService;
import com.ueims.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/student-profiles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StudentProfileController {
    private final StudentProfileService service;
    private final com.ueims.mapper.StudentProfileMapper mapper;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<java.util.List<com.ueims.dto.response.StudentProfileDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyProfile() {
        UUID userId = userService.getCurrentUserId();
        com.ueims.model.entity.StudentProfile profile = service.findByUserId(userId);
        if (profile == null) {
            return ResponseEntity.ok(java.util.Map.of("result", java.util.Map.of()));
        }
        return ResponseEntity.ok(java.util.Map.of("result", mapper.toDto(profile)));
    }

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasRole('STUDENT') or hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<com.ueims.dto.response.StudentProfileDTO> getById(@PathVariable UUID id) {
        com.ueims.model.entity.StudentProfile profile = service.findById(id);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapper.toDto(profile));
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

    @PostMapping("/upload-cv")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<com.ueims.dto.response.StudentProfileDTO> uploadCv(@RequestParam("file") MultipartFile file) {
        UUID userId = userService.getCurrentUserId();
        com.ueims.model.entity.StudentProfile profile = service.findByUserId(userId);
        if (profile == null) {
            throw new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND);
        }
        return ResponseEntity.ok(mapper.toDto(service.uploadCv(profile.getProfileId(), file)));
    }

    @DeleteMapping("/upload-cv")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<com.ueims.dto.response.StudentProfileDTO> deleteCv() {
        UUID userId = userService.getCurrentUserId();
        com.ueims.model.entity.StudentProfile profile = service.findByUserId(userId);
        if (profile == null) {
            throw new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND);
        }
        return ResponseEntity.ok(mapper.toDto(service.deleteCv(profile.getProfileId())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
