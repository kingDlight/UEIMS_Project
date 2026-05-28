package com.ueims.service;

import java.util.List;

import com.ueims.model.entity.Role;

public interface RoleService {
    List<Role> findAll();

    Role findById(String id);

    Role save(Role entity);

    void deleteById(String id);
}
