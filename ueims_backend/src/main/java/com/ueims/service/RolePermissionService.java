package com.ueims.service;

import com.ueims.model.entity.RolePermission;
import com.ueims.model.entity.RolePermissionId;
import java.util.List;

public interface RolePermissionService {
    List<RolePermission> findAll();
    RolePermission findById(RolePermissionId id);
    RolePermission save(RolePermission entity);
    void deleteById(RolePermissionId id);
}
