package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.UserCreationRequest;
import com.ueims.dto.request.UserUpdateRequest;
import com.ueims.dto.request.UpdateEmailRequest;
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
            @org.springframework.web.bind.annotation.RequestParam("file")
                    org.springframework.web.multipart.MultipartFile file)
            throws java.io.IOException {
        String url = service.uploadAvatar(file);
        return ResponseEntity.ok(java.util.Map.of("avatarUrl", url));
    }

    @GetMapping("/avatars")
    public ResponseEntity<java.util.List<java.util.Map<String, String>>> listAvailableAvatars()
            throws java.io.IOException {
        java.nio.file.Path dir = java.nio.file.Paths.get(System.getProperty("user.dir"), "uploads", "avatars");
        if (!java.nio.file.Files.exists(dir)) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        java.util.List<java.util.Map<String, String>> items = new java.util.ArrayList<>();
        try (java.util.stream.Stream<java.nio.file.Path> stream = java.nio.file.Files.list(dir)) {
            stream.filter(p -> java.nio.file.Files.isRegularFile(p)).forEach(p -> {
                String name = p.getFileName().toString();
                String lower = name.toLowerCase();
                if (!(lower.endsWith(".png")
                        || lower.endsWith(".jpg")
                        || lower.endsWith(".jpeg")
                        || lower.endsWith(".gif")
                        || lower.endsWith(".webp"))) return;
                try {
                    items.add(java.util.Map.of(
                            "filename",
                            name,
                            "url",
                            "/api/users/avatars/" + name,
                            "size",
                            String.valueOf(java.nio.file.Files.size(p))));
                } catch (java.io.IOException ignored) {
                }
            });
        }
        items.sort((a, b) -> b.get("filename").compareTo(a.get("filename")));
        return ResponseEntity.ok(items);
    }

    @GetMapping("/avatars/{filename:.+}")
    public ResponseEntity<byte[]> getAvatar(@org.springframework.web.bind.annotation.PathVariable String filename)
            throws java.io.IOException {
        java.nio.file.Path baseDir = java.nio.file.Paths.get(System.getProperty("user.dir"), "uploads", "avatars")
                .toAbsolutePath()
                .normalize();
        java.nio.file.Path path = baseDir.resolve(filename).normalize();
        if (!path.startsWith(baseDir)) {
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
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) Integer durationMinutes) {
        service.updateUserStatus(id, status, durationMinutes);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/email")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<UserDetailResponse> updateEmail(
            @PathVariable UUID id, @RequestBody @Valid UpdateEmailRequest request) {
        return ResponseEntity.ok(service.updateUserEmail(id, request));
    }
}
