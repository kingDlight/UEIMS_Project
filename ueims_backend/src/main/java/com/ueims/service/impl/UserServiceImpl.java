package com.ueims.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.request.UserCreationRequest;
import com.ueims.dto.response.UserDetailResponse;
import com.ueims.dto.response.UserResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.User;
import com.ueims.repository.InvalidatedTokenRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.UserSessionRepository;
import com.ueims.service.MailService;
import com.ueims.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {
    UserRepository repository;
    MailService mailService;
    PasswordEncoder passwordEncoder;
    UserSessionRepository userSessionRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;

    private static final long MAX_AVATAR_BYTES = 2L * 1024 * 1024;
    private static final Set<String> ALLOWED_AVATAR_TYPES =
            Set.of("image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp");

    @Transactional
    public String uploadAvatar(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FIELD_REQUIRED, "Avatar file is required");
        }
        if (file.getSize() > MAX_AVATAR_BYTES) {
            throw new AppException(ErrorCode.INVALID_KEY, "Avatar file too large (max 2MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_AVATAR_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_KEY, "Unsupported image type. Allowed: png, jpg, jpeg, gif, webp");
        }

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String ext = original.contains(".")
                ? original.substring(original.lastIndexOf('.')).toLowerCase()
                : "";
        if (!ext.matches("\\.(png|jpg|jpeg|gif|webp)")) {
            throw new AppException(ErrorCode.INVALID_KEY, "Invalid file extension. Allowed: png, jpg, jpeg, gif, webp");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser =
                repository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "avatars");
        Files.createDirectories(uploadDir);

        String filename = currentUser.getUserId() + "_" + UUID.randomUUID() + ext;
        Path target = uploadDir.resolve(filename);
        file.transferTo(target.toAbsolutePath());

        currentUser.setAvatarUrl("/api/users/avatars/" + filename);
        repository.save(currentUser);

        log.info("[Avatar] user={} uploaded avatar -> {}", currentUser.getUserId(), currentUser.getAvatarUrl());
        return currentUser.getAvatarUrl();
    }

    @Override
    public List<UserDetailResponse> findAll() {
        return repository.findAll().stream().map(this::toDetailResponse).toList();
    }

    @Override
    public UserDetailResponse findById(UUID id) {
        return toDetailResponse(
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }

    @Override
    public User save(User entity) {
        return repository.save(entity);
    }

    @Override
    public User createUser(UserCreationRequest request) {
        // BR-05: Email must be universally unique across all roles
        if (repository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        String randomPassword = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
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
        // UC-10 PRE-1 + 10.0.E1: Admin cannot change status of their own active session
        // account
        UUID currentUserId = getCurrentUserId();
        if (user.getUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.ADMIN_INTERVENTION_REQUIRED);
        }
        user.setStatus(status);
        repository.save(user);

        // UC-10 Other Information: Force logout active sessions when status becomes
        // INACTIVE/LOCKED
        if ("INACTIVE".equalsIgnoreCase(status) || "LOCKED".equalsIgnoreCase(status)) {
            forceLogoutUser(user.getEmail());
        }
    }

    private void forceLogoutUser(String email) {
        try {
            var sessions = userSessionRepository.findByEmail(email);
            for (var session : sessions) {
                invalidatedTokenRepository.save(com.ueims.model.entity.InvalidatedToken.builder()
                        .tokenId(session.getTokenId())
                        .expiresAt(session.getExpiresAt())
                        .build());
            }
            userSessionRepository.deleteByEmail(email);
        } catch (Exception e) {
            log.warn("Force logout failed for user {}: {}", email, e.getMessage());
        }
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
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    @Override
    public UUID getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return repository
                .findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED))
                .getUserId();
    }

    @Override
    public UserResponse updateMyInfo(com.ueims.dto.request.UserUpdateRequest request) {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        User user = repository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        repository.save(user);

        return getMyInfo();
    }

    @Override
    public UserDetailResponse updateUser(UUID id, com.ueims.dto.request.UserUpdateRequest request) {
        User user = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        // UC-09 Other Information: Email is read-only; only fullName and phone can be
        // updated via this UC.
        // Status is changed through UC-10 (updateUserStatus), not here.
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        repository.save(user);
        return toDetailResponse(user);
    }

    private UserDetailResponse toDetailResponse(User user) {
        var lastLogin = user.getLastLoginAt();

        Set<String> roleNames = user.getRoles() == null
                ? Set.of()
                : user.getRoles().stream()
                        .filter(ur -> ur.getRole() != null)
                        .map(ur -> ur.getRole().getRoleName())
                        .collect(Collectors.toSet());

        return UserDetailResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .status(user.getStatus())
                .avatarUrl(user.getAvatarUrl())
                .authProvider(user.getAuthProvider())
                .failedLoginAttempts(user.getFailedLoginAttempts())
                .lockedUntil(user.getLockedUntil())
                .mustChangePassword(user.getMustChangePassword())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLogin(lastLogin)
                .roles(roleNames)
                .build();
    }
}
