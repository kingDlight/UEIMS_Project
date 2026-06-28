package com.ueims.service;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.request.UpdateEmailRequest;
import com.ueims.dto.request.UserCreationRequest;
import com.ueims.dto.request.UserUpdateRequest;
import com.ueims.dto.response.UserDetailResponse;
import com.ueims.dto.response.UserResponse;
import com.ueims.model.entity.User;

public interface UserService {
    List<UserDetailResponse> findAll();

    UserDetailResponse findById(UUID id);

    User save(User entity);

    User createUser(UserCreationRequest request);

    void deleteById(UUID id);

    void updateUserStatus(UUID id, String status);

    void updateUserStatus(UUID id, String status, Integer durationMinutes);

    UserResponse getMyInfo();

    UUID getCurrentUserId();

    UserResponse updateMyInfo(UserUpdateRequest request);

    UserDetailResponse updateUser(UUID id, UserUpdateRequest request);

    UserDetailResponse updateUserEmail(UUID id, UpdateEmailRequest request);

    String uploadAvatar(MultipartFile file) throws IOException;
}
