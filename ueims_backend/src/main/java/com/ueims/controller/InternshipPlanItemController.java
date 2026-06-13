package com.ueims.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.service.InternshipPlanItemService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/internship-plan-items")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternshipPlanItemController {
    InternshipPlanItemService service;
    com.ueims.mapper.InternshipPlanItemMapper mapper;

    @GetMapping
    public ResponseEntity<java.util.List<com.ueims.dto.response.InternshipPlanItemDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.ueims.dto.response.InternshipPlanItemDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<com.ueims.dto.response.InternshipPlanItemDTO> create(
            @Valid @RequestBody com.ueims.dto.request.InternshipPlanItemRequestDTO request) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(request))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<com.ueims.dto.response.InternshipPlanItemDTO> update(
            @PathVariable UUID id, @Valid @RequestBody com.ueims.dto.request.InternshipPlanItemRequestDTO request) {
        com.ueims.model.entity.InternshipPlanItem entity = mapper.toEntity(request);
        entity.setPlanItemId(id);
        return ResponseEntity.ok(mapper.toDto(service.save(entity)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
