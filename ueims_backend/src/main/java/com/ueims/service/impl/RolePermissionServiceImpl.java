package com.ueims.service.impl;

import com.ueims.model.entity.RolePermission;
import com.ueims.repository.RolePermissionRepository;
import com.ueims.service.RolePermissionService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RolePermissionServiceImpl implements RolePermissionService {
    private final RolePermissionRepository repository;

    @Override
    public List<RolePermission> findAll() { return repository.findAll(); }

    @Override
    public RolePermission findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public RolePermission save(RolePermission entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
