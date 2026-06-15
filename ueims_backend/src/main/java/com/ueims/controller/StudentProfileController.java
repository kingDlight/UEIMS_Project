package com.ueims.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.request.StudentProfileUpdateRequest;
import com.ueims.dto.response.StudentProfileResponseDTO;
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
    public ResponseEntity<List<StudentProfileResponseDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getMyProfile() {
        UUID userId = userService.getCurrentUserId();
        com.ueims.model.entity.StudentProfile profile = service.findByUserId(userId);
        if (profile == null) {
            return ResponseEntity.ok(Map.of("result", Map.of()));
        }
        return ResponseEntity.ok(Map.of("result", service.getMyFullProfile(userId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasRole('STUDENT') or hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StudentProfileResponseDTO> getById(@PathVariable UUID id) {
        com.ueims.model.entity.StudentProfile profile = service.findById(id);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapper.toDto(profile));
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StudentProfileResponseDTO> create(@Valid @RequestBody StudentProfileResponseDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileResponseDTO> update(
            @PathVariable UUID id, @Valid @RequestBody StudentProfileUpdateRequest request) {
        return ResponseEntity.ok(mapper.toDto(service.updateProfile(id, request)));
    }

    @PostMapping("/upload-cv")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileResponseDTO> uploadCv(@RequestParam("file") MultipartFile file) {
        UUID userId = userService.getCurrentUserId();
        com.ueims.model.entity.StudentProfile profile = service.findByUserId(userId);
        if (profile == null) {
            throw new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND);
        }
        return ResponseEntity.ok(mapper.toDto(service.uploadCv(profile.getProfileId(), file)));
    }

    @DeleteMapping("/upload-cv")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileResponseDTO> deleteCv() {
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
