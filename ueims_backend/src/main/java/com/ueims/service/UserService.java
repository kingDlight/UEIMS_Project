package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.UserCreationRequest;
import com.ueims.dto.response.UserResponse;
import com.ueims.model.entity.User;

public interface UserService {
    List<User> findAll();

    User findById(UUID id);

    User save(User entity);

    User createUser(UserCreationRequest request);

    void deleteById(UUID id);

    void updateUserStatus(UUID id, String status);

    UserResponse getMyInfo();

    UUID getCurrentUserId();
}
