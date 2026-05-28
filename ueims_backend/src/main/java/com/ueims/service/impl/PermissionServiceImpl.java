package com.ueims.service.impl;

import com.ueims.model.entity.Permission;
import com.ueims.repository.PermissionRepository;
import com.ueims.service.PermissionService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {
    private final PermissionRepository repository;

    @Override
    public List<Permission> findAll() { return repository.findAll(); }

    @Override
    public Permission findById(String id) { return repository.findById(id).orElse(null); }

    @Override
    public Permission save(Permission entity) { return repository.save(entity); }

    @Override
    public void deleteById(String id) { repository.deleteById(id); }
}
