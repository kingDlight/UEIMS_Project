package com.ueims.service;

import com.ueims.model.entity.Role;
import java.util.List;

public interface RoleService {
    List<Role> findAll();
    Role findById(String id);
    Role save(Role entity);
    void deleteById(String id);
}
