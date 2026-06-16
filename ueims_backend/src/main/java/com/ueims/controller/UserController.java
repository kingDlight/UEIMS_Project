package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.UserCreationRequest;
import com.ueims.dto.request.UserUpdateRequest;
import com.ueims.dto.response.UserResponse;
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
    PasswordEncoder passwordEncoder;

    @GetMapping("/myInfo")
    public ResponseEntity<UserResponse> getMyInfo() {
        return ResponseEntity.ok(service.getMyInfo());
    }

    @PutMapping("/myInfo")
    public ResponseEntity<UserResponse> updateMyInfo(@RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(service.updateMyInfo(request));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody @Valid UserCreationRequest request) {
        return ResponseEntity.ok(service.createUser(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable UUID id, @RequestBody UserUpdateRequest request) {
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
}
