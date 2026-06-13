package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.EnterpriseAssignmentService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EnterpriseAssignmentServiceImpl implements EnterpriseAssignmentService {
    EnterpriseAssignmentRepository repository;
    UserRepository userRepository;

    @Override
    public List<EnterpriseAssignment> findAll() {
        return repository.findAll();
    }

    @Override
    public EnterpriseAssignment findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public EnterpriseAssignment findMyAssignment(UUID studentId) {
        return repository.findByStudent_UserId(studentId).orElse(null);
    }

    @Override
    public List<EnterpriseAssignment> findMyEnterpriseAssignments() {
        User currentUser = userRepository
                .findByEmail(
                        SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (currentUser.getEnterprise() == null) {
            return List.of();
        }
        UUID enterpriseId = currentUser.getEnterprise().getEnterpriseId();
        return repository.findByEnterprise_EnterpriseId(enterpriseId);
    }

    @Override
    public EnterpriseAssignment save(EnterpriseAssignment entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
