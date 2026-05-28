package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.UserCreationRequest;
import com.ueims.dto.response.UserResponse;
import com.ueims.model.entity.User;
import com.ueims.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService service;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/myInfo")
    public ResponseEntity<UserResponse> getMyInfo() {
        return ResponseEntity.ok(service.getMyInfo());
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
    public ResponseEntity<User> create(@RequestBody UserCreationRequest request) {
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .status("ACTIVE")
                .build();
        return ResponseEntity.ok(service.save(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
