package com.ueims.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.Permission;
import com.ueims.repository.PermissionRepository;
import com.ueims.service.PermissionService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionServiceImpl implements PermissionService {
    PermissionRepository repository;

    @Override
    public List<Permission> findAll() {
        return repository.findAll();
    }

    @Override
    public Permission findById(String id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Permission save(Permission entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
