package com.ueims.service.impl;

import com.ueims.model.entity.Role;
import com.ueims.repository.RoleRepository;
import com.ueims.service.RoleService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleRepository repository;

    @Override
    public List<Role> findAll() { return repository.findAll(); }

    @Override
    public Role findById(String id) { return repository.findById(id).orElse(null); }

    @Override
    public Role save(Role entity) { return repository.save(entity); }

    @Override
    public void deleteById(String id) { repository.deleteById(id); }
}
