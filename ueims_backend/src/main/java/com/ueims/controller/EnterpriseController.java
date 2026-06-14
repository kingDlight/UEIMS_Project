package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.response.ApiResponse;
import com.ueims.dto.response.EnterpriseDTO;
import com.ueims.mapper.EnterpriseMapper;
import com.ueims.service.EnterpriseService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/enterprises")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EnterpriseController {
    EnterpriseService service;
    EnterpriseMapper mapper;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')") // UC-18
    public ApiResponse<List<EnterpriseDTO>> getAll() {
        return ApiResponse.<List<EnterpriseDTO>>builder()
                .result(service.findAll().stream().map(mapper::toDto).toList())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ENTERPRISE')") // UC-35
    public ApiResponse<EnterpriseDTO> getById(@PathVariable UUID id) {
        return ApiResponse.<EnterpriseDTO>builder()
                .result(mapper.toDto(service.findById(id)))
                .build();
    }

    @GetMapping("/my-profile")
    @PreAuthorize("hasRole('ENTERPRISE')") // UC-35: Enterprise viewing own profile
    public ApiResponse<EnterpriseDTO> getMyProfile() {
        return ApiResponse.<EnterpriseDTO>builder()
                .result(mapper.toDto(service.getMyEnterpriseProfile()))
                .message("Enterprise profile retrieved successfully")
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<EnterpriseDTO> create(@Valid @RequestBody com.ueims.dto.request.EnterpriseRequest request) {
        return ApiResponse.<EnterpriseDTO>builder()
                .result(mapper.toDto(service.save(request)))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ENTERPRISE')") // UC-36: Chỉ Enterprise được sửa profile của chính họ
    public ApiResponse<EnterpriseDTO> update(
            @PathVariable UUID id, @Valid @RequestBody com.ueims.dto.request.EnterpriseRequest request) {
        return ApiResponse.<EnterpriseDTO>builder()
                .result(mapper.toDto(service.update(id, request)))
                .message("Enterprise profile updated successfully")
                .build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('TRAINING_MANAGER')") // UC-19: Chỉ TM có quyền duyệt/từ chối
    public ApiResponse<EnterpriseDTO> approveRejectEnterprise(
            @PathVariable UUID id, @RequestParam String status, @RequestParam(required = false) String reason) {
        return ApiResponse.<EnterpriseDTO>builder()
                .result(mapper.toDto(service.approveReject(id, status, reason)))
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
