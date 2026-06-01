package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Enterprise;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.service.EnterpriseService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnterpriseServiceImpl implements EnterpriseService {
    private final EnterpriseRepository repository;

    @Override
    public List<Enterprise> findAll() {
        return repository.findAll();
    }

    @Override
    public Enterprise findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Enterprise save(Enterprise entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public Enterprise approve(UUID id) {
        Enterprise enterprise =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ENTERPRISE_NOT_FOUND));
        enterprise.setStatus("ACTIVE");
        enterprise.setRejectionReason(null);
        return repository.save(enterprise);
    }

    @Override
    @Transactional
    public Enterprise reject(UUID id, String rejectionReason) {
        Enterprise enterprise =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ENTERPRISE_NOT_FOUND));
        enterprise.setStatus("REJECTED");
        enterprise.setRejectionReason(rejectionReason);
        return repository.save(enterprise);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
