package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.PasswordResetToken;

public interface PasswordResetTokenService {
    List<PasswordResetToken> findAll();

    PasswordResetToken findById(UUID id);

    PasswordResetToken save(PasswordResetToken entity);

    void deleteById(UUID id);
}
