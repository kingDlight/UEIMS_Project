package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.User;

public interface UserService {
    List<User> findAll();

    User findById(UUID id);

    User save(User entity);

    void deleteById(UUID id);
}
