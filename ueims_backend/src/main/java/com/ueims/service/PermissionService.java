package com.ueims.service;

import java.util.List;

import com.ueims.model.entity.Permission;

public interface PermissionService {
    List<Permission> findAll();

    Permission findById(String id);

    Permission save(Permission entity);

    void deleteById(String id);
}
