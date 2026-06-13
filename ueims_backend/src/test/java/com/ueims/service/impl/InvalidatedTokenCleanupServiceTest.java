package com.ueims.service.impl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.repository.InvalidatedTokenRepository;

@ExtendWith(MockitoExtension.class)
class InvalidatedTokenCleanupServiceTest {

    @Mock
    private InvalidatedTokenRepository repository;

    @InjectMocks
    private InvalidatedTokenCleanupService service;

    @Test
    void cleanupExpiredTokensSuccess() {
        service.cleanupExpiredTokens();

        verify(repository).deleteAllByExpiresAtBefore(any(LocalDateTime.class));
    }
}
