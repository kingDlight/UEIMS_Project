package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.SystemAnnouncement;
import com.ueims.service.SystemAnnouncementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/system-announcements")
@RequiredArgsConstructor
public class SystemAnnouncementController {
    private final SystemAnnouncementService service;

    @GetMapping
    public ResponseEntity<List<SystemAnnouncement>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SystemAnnouncement> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<SystemAnnouncement> create(@RequestBody SystemAnnouncement entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
