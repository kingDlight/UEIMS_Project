package com.ueims.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
import com.ueims.repository.UserRoleRepository;
import com.ueims.service.UserRoleService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserRoleServiceImpl implements UserRoleService {
    private final UserRoleRepository repository;

    @Override
    public List<UserRole> findAll() {
        return repository.findAll();
    }

    @Override
    public UserRole findById(UserRoleId id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public UserRole save(UserRole entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UserRoleId id) {
        repository.deleteById(id);
    }
}
