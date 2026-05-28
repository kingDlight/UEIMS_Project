package com.ueims.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.RolePermission;
import com.ueims.model.entity.RolePermissionId;
import com.ueims.repository.RolePermissionRepository;
import com.ueims.service.RolePermissionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RolePermissionServiceImpl implements RolePermissionService {
    private final RolePermissionRepository repository;

    @Override
    public List<RolePermission> findAll() {
        return repository.findAll();
    }

    @Override
    public RolePermission findById(RolePermissionId id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public RolePermission save(RolePermission entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(RolePermissionId id) {
        repository.deleteById(id);
    }
}
