package com.ueims.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.Role;
import com.ueims.repository.RoleRepository;
import com.ueims.service.RoleService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImpl implements RoleService {
    RoleRepository repository;

    @Override
    public List<Role> findAll() {
        return repository.findAll();
    }

    @Override
    public Role findById(String id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Role save(Role entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
