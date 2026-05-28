package com.ueims.service;

import java.util.List;

import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;

public interface UserRoleService {
    List<UserRole> findAll();

    UserRole findById(UserRoleId id);

    UserRole save(UserRole entity);

    void deleteById(UserRoleId id);
}
