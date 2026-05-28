package com.ueims.service;

import com.ueims.model.entity.UserRole;
import java.util.List;
import java.util.UUID;

public interface UserRoleService {
    List<UserRole> findAll();
    UserRole findById(UUID id);
    UserRole save(UserRole entity);
    void deleteById(UUID id);
}
