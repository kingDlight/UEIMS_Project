package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.UserRoleRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Role;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
import com.ueims.repository.RoleRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.UserRoleRepository;
import com.ueims.service.UserRoleService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserRoleServiceImpl implements UserRoleService {
    UserRoleRepository repository;
    UserRepository userRepository;
    RoleRepository roleRepository;

    @Override
    public List<UserRole> findAll() {
        return repository.findAll();
    }

    @Override
    public UserRole findById(UserRoleId id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public UserRole save(UserRole entity) {
        if (entity.getUser() != null && entity.getUser().getUserId() != null) {
            long existing = repository.countByUserUserId(entity.getUser().getUserId());
            if (existing > 0) {
                throw new AppException(ErrorCode.USER_ALREADY_HAS_ROLE);
            }
        }
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UserRoleId id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public void assignRole(UserRoleRequest request) {
        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Role role = roleRepository
                .findById(request.getRoleName().toUpperCase())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        UserRoleId id = new UserRoleId(user.getUserId(), role.getRoleName());

        if (repository.existsById(id)) {
            throw new AppException(ErrorCode.USER_ALREADY_HAS_ROLE);
        }

        UserRole userRole = UserRole.builder().id(id).user(user).role(role).build();
        repository.save(userRole);
    }

    @Override
    @Transactional
    public void revokeRole(UUID userId, String roleName) {
        UserRoleId id = new UserRoleId(userId, roleName.toUpperCase());
        if (!repository.existsById(id)) {
            throw new AppException(ErrorCode.USER_ROLE_NOT_FOUND);
        }
        repository.deleteById(id);
    }
}
