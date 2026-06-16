package com.ueims.dto.response;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDetailResponse {
    UUID userId;
    String email;
    String fullName;
    String phone;
    String status;
    String avatarUrl;
    String authProvider;
    Integer failedLoginAttempts;
    LocalDateTime lockedUntil;
    Boolean mustChangePassword;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    LocalDateTime lastLogin;
    Set<String> roles;
}
