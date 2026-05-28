package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.PasswordResetToken;
import com.ueims.repository.PasswordResetTokenRepository;
import com.ueims.service.PasswordResetTokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordResetTokenServiceImpl implements PasswordResetTokenService {
    private final PasswordResetTokenRepository repository;

    @Override
    public List<PasswordResetToken> findAll() {
        return repository.findAll();
    }

    @Override
    public PasswordResetToken findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public PasswordResetToken save(PasswordResetToken entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
