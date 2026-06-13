package com.ueims.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
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
}
