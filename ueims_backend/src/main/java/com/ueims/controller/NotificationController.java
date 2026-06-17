package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.service.NotificationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {
    NotificationService service;
    com.ueims.mapper.NotificationMapper mapper;

    @GetMapping
    public ResponseEntity<List<com.ueims.dto.response.NotificationDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my/unread-count")
    public ResponseEntity<java.util.Map<String, Long>> getUnreadCount() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return ResponseEntity.ok(java.util.Map.of("count", service.countUnreadForEmail(email)));
    }

    @GetMapping("/my")
    public ResponseEntity<List<com.ueims.dto.response.NotificationDTO>> getMyNotifications() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return ResponseEntity.ok(
                service.getMyNotifications(email).stream().map(mapper::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.ueims.dto.response.NotificationDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<com.ueims.dto.response.NotificationDTO> create(
            @Valid @RequestBody com.ueims.dto.response.NotificationDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<com.ueims.dto.response.NotificationDTO> markAsRead(@PathVariable UUID id) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return ResponseEntity.ok(mapper.toDto(service.markAsRead(id, email)));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<java.util.Map<String, Object>> broadcast(
            @Valid @RequestBody com.ueims.dto.request.BroadcastNotificationRequest request) {
        int sent = service.broadcast(request);
        return ResponseEntity.ok(java.util.Map.of("sent", sent, "title", request.getTitle()));
    }
}
