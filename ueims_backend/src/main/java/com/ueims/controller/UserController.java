package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.UserCreationRequest;
import com.ueims.dto.request.UserUpdateRequest;
import com.ueims.dto.response.UserDetailResponse;
import com.ueims.model.entity.User;
import com.ueims.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService service;

    @GetMapping("/myInfo")
    public ResponseEntity<com.ueims.dto.response.UserResponse> getMyInfo() {
        return ResponseEntity.ok(service.getMyInfo());
    }

    @PutMapping("/myInfo")
    public ResponseEntity<com.ueims.dto.response.UserResponse> updateMyInfo(@RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(service.updateMyInfo(request));
    }

    @PostMapping(value = "/me/avatar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<java.util.Map<String, String>> uploadAvatar(
            @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        String url = service.uploadAvatar(file);
        return ResponseEntity.ok(java.util.Map.of("avatarUrl", url));
    }

    @GetMapping("/avatars/{filename:.+}")
    public ResponseEntity<byte[]> getAvatar(@org.springframework.web.bind.annotation.PathVariable String filename) throws java.io.IOException {
        java.nio.file.Path path = java.nio.file.Paths.get("uploads/avatars").resolve(filename).normalize();
        if (!path.startsWith(java.nio.file.Paths.get("uploads/avatars"))) {
            return ResponseEntity.badRequest().build();
        }
        byte[] data = java.nio.file.Files.readAllBytes(path);
        String contentType = "image/png";
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (filename.endsWith(".gif")) contentType = "image/gif";
        else if (filename.endsWith(".webp")) contentType = "image/webp";
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(data);
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<List<UserDetailResponse>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<UserDetailResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<User> create(@RequestBody @Valid UserCreationRequest request) {
        return ResponseEntity.ok(service.createUser(request));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<UserDetailResponse> update(@PathVariable UUID id, @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(service.updateUser(id, request));
    }

    @PutMapping("/{id}/lock")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> lockUser(@PathVariable UUID id) {
        service.updateUserStatus(id, "INACTIVE");
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/unlock")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> unlockUser(@PathVariable UUID id) {
        service.updateUserStatus(id, "ACTIVE");
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        service.updateUserStatus(id, status);
        return ResponseEntity.ok().build();
    }
}
