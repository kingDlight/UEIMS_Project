package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.UserRoleRequest;
import com.ueims.dto.response.ApiResponse;
import com.ueims.model.entity.UserRole;
import com.ueims.service.UserRoleService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/users-roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserRoleController {
    UserRoleService service;

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ApiResponse<List<UserRole>> getAll() {
        return ApiResponse.<List<UserRole>>builder()
                .result(service.findAll())
                .message("Lấy danh sách phân quyền thành công")
                .build();
    }

    @PostMapping("/assign")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ApiResponse<Void> assignRole(@Valid @RequestBody UserRoleRequest request) {
        service.assignRole(request);
        return ApiResponse.<Void>builder().message("Gán quyền thành công").build();
    }

    @DeleteMapping("/revoke/{userId}/{roleName}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ApiResponse<Void> revokeRole(@PathVariable UUID userId, @PathVariable String roleName) {
        service.revokeRole(userId, roleName);
        return ApiResponse.<Void>builder().message("Thu hồi quyền thành công").build();
    }
}
