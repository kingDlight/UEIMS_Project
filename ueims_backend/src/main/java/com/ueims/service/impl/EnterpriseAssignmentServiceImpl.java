package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.response.EnterpriseAssignmentDTO;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.mapper.EnterpriseAssignmentMapper;
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
    EnterpriseAssignmentMapper mapper;

    @Override
    public List<EnterpriseAssignment> findAll() {
        return repository.findAll();
    }

    @Override
    public EnterpriseAssignment findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public List<EnterpriseAssignment> findByEnterpriseId(UUID enterpriseId) {
        return repository.findByEnterprise_EnterpriseId(enterpriseId);
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
    @Transactional
    public EnterpriseAssignment update(UUID id, EnterpriseAssignmentDTO dto) {
        EnterpriseAssignment existing =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));

        mapper.updateEntity(dto, existing);
        return repository.save(existing);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
