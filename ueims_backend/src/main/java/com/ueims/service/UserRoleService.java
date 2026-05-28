package com.ueims.service;

import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
import java.util.List;

public interface UserRoleService {
    List<UserRole> findAll();
    UserRole findById(UserRoleId id);
    UserRole save(UserRole entity);
    void deleteById(UserRoleId id);
}
