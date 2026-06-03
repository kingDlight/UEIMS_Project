package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.response.ApiResponse;
import com.ueims.model.entity.Enterprise;
import com.ueims.service.EnterpriseService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/enterprises")
@RequiredArgsConstructor
public class EnterpriseController {
    private final EnterpriseService service;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')") // UC-18
    public ApiResponse<List<Enterprise>> getAll() {
        return ApiResponse.<List<Enterprise>>builder().result(service.findAll()).build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ENTERPRISE')") // UC-35
    public ApiResponse<Enterprise> getById(@PathVariable UUID id) {
        // Logic kiểm tra ownership được thực hiện trong service
        return ApiResponse.<Enterprise>builder().result(service.findById(id)).build();
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<Enterprise> create(@Valid @RequestBody Enterprise entity) {
        return ApiResponse.<Enterprise>builder().result(service.save(entity)).build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ENTERPRISE')") // UC-36: Chỉ Enterprise được sửa profile của chính họ
    public ApiResponse<Enterprise> update(@PathVariable UUID id, @Valid @RequestBody Enterprise entity) {
        return ApiResponse.<Enterprise>builder()
                .result(service.update(id, entity))
                .message("Enterprise profile updated successfully")
                .build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('TRAINING_MANAGER')") // UC-19: Chỉ TM có quyền duyệt/từ chối
    public ApiResponse<Enterprise> approveRejectEnterprise(
            @PathVariable UUID id, @RequestParam String status, @RequestParam(required = false) String reason) {
        return ApiResponse.<Enterprise>builder()
                .result(service.approveReject(id, status, reason))
                .message("Enterprise status updated to " + status)
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ApiResponse.<Void>builder()
                .message("Enterprise deleted successfully")
                .build();
    }
}
