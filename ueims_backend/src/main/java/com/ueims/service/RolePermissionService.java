package com.ueims.service;

import com.ueims.model.entity.RolePermission;
import java.util.List;
import java.util.UUID;

public interface RolePermissionService {
    List<RolePermission> findAll();
    RolePermission findById(UUID id);
    RolePermission save(RolePermission entity);
    void deleteById(UUID id);
}
