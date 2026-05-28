package com.ueims.service;

import java.util.List;

import com.ueims.model.entity.RolePermission;
import com.ueims.model.entity.RolePermissionId;

public interface RolePermissionService {
    List<RolePermission> findAll();

    RolePermission findById(RolePermissionId id);

    RolePermission save(RolePermission entity);

    void deleteById(RolePermissionId id);
}
