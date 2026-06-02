package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ueims.dto.response.UserResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.User;
import com.ueims.repository.UserRepository;
import com.ueims.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository repository;
    private final com.ueims.service.MailService mailService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public List<User> findAll() {
        return repository.findAll();
    }

    @Override
    public User findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public User save(User entity) {
        return repository.save(entity);
    }

    @Override
    public User createUser(com.ueims.dto.request.UserCreationRequest request) {
        String randomPassword =
                java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(randomPassword))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .status("ACTIVE")
                .mustChangePassword(true)
                .build();
        user = repository.save(user);
        mailService.sendWelcomeMail(user.getEmail(), user.getFullName(), randomPassword);
        return user;
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public void updateUserStatus(UUID id, String status) {
        User user = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setStatus(status);
        repository.save(user);
    }

    @Override
    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();

        User user = repository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .status(user.getStatus())
                .build();
    }
}
