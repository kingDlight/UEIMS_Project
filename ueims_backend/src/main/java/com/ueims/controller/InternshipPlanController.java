package com.ueims.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.service.InternshipPlanService;
import com.ueims.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/internship-plans")
@RequiredArgsConstructor
public class InternshipPlanController {
    private final InternshipPlanService service;
    private final com.ueims.mapper.InternshipPlanMapper mapper;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<java.util.List<com.ueims.dto.response.InternshipPlanDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-plan")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<com.ueims.dto.response.InternshipPlanDTO> getMyPlan() {
        return ResponseEntity.ok(mapper.toDto(service.findMyPlan(userService.getCurrentUserId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.ueims.dto.response.InternshipPlanDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<com.ueims.dto.response.InternshipPlanDTO> create(
            @Valid @RequestBody com.ueims.dto.response.InternshipPlanDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
