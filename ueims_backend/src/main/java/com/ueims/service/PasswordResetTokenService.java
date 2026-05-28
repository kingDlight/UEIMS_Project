package com.ueims.service;

import com.ueims.model.entity.PasswordResetToken;
import java.util.List;
import java.util.UUID;

public interface PasswordResetTokenService {
    List<PasswordResetToken> findAll();
    PasswordResetToken findById(UUID id);
    PasswordResetToken save(PasswordResetToken entity);
    void deleteById(UUID id);
}
