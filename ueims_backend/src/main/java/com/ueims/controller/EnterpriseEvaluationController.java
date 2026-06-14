package com.ueims.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.response.EnterpriseEvaluationDTO;
import com.ueims.service.EnterpriseEvaluationService;
import com.ueims.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/enterprise-evaluations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EnterpriseEvaluationController {
    private final EnterpriseEvaluationService service;
    private final com.ueims.mapper.EnterpriseEvaluationMapper mapper;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<EnterpriseEvaluationDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-evaluation")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getMyEvaluation() {
        var evaluation = service.findMyEvaluation(userService.getCurrentUserId());
        if (evaluation == null) {
            return ResponseEntity.ok(Map.of("result", Map.of()));
        }
        return ResponseEntity.ok(Map.of("result", mapper.toDto(evaluation)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('ENTERPRISE') or hasRole('STUDENT')")
    public ResponseEntity<EnterpriseEvaluationDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ENTERPRISE')")
    public ResponseEntity<EnterpriseEvaluationDTO> create(@Valid @RequestBody EnterpriseEvaluationDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ENTERPRISE')")
    public ResponseEntity<EnterpriseEvaluationDTO> update(
            @PathVariable UUID id, @Valid @RequestBody EnterpriseEvaluationDTO dto) {
        return ResponseEntity.ok(mapper.toDto(service.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
