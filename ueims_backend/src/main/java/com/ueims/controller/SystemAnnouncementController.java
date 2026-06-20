package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.AnnouncementCreationRequest;
import com.ueims.dto.response.SystemAnnouncementDTO;
import com.ueims.service.SystemAnnouncementService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/system-announcements")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SystemAnnouncementController {
    SystemAnnouncementService service;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<List<SystemAnnouncementDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SystemAnnouncementDTO>> getActiveAnnouncements() {
        return ResponseEntity.ok(service.findActiveAnnouncements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SystemAnnouncementDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<SystemAnnouncementDTO> create(@Valid @RequestBody AnnouncementCreationRequest request) {
        return ResponseEntity.ok(service.createAnnouncement(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<SystemAnnouncementDTO> update(
            @PathVariable UUID id, @Valid @RequestBody AnnouncementCreationRequest request) {
        return ResponseEntity.ok(service.updateAnnouncement(id, request));
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<SystemAnnouncementDTO> publish(@PathVariable UUID id) {
        return ResponseEntity.ok(service.updateStatus(id, "PUBLISHED"));
    }

    @PutMapping("/{id}/archive")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<SystemAnnouncementDTO> archive(@PathVariable UUID id) {
        return ResponseEntity.ok(service.updateStatus(id, "ARCHIVED"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
