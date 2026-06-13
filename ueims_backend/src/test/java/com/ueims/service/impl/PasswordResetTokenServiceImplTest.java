package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.model.entity.PasswordResetToken;
import com.ueims.repository.PasswordResetTokenRepository;

@ExtendWith(MockitoExtension.class)
class PasswordResetTokenServiceImplTest {

    @Mock
    private PasswordResetTokenRepository repository;

    @InjectMocks
    private PasswordResetTokenServiceImpl service;

    private PasswordResetToken token;
    private UUID tokenId;

    @BeforeEach
    void setUp() {
        tokenId = UUID.randomUUID();
        token = PasswordResetToken.builder()
                .tokenId(tokenId)
                .tokenHash("sample-token-123")
                .build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(token));

        List<PasswordResetToken> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(tokenId, result.get(0).getTokenId());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(tokenId)).thenReturn(Optional.of(token));

        PasswordResetToken result = service.findById(tokenId);

        assertNotNull(result);
        assertEquals(tokenId, result.getTokenId());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(tokenId)).thenReturn(Optional.empty());

        PasswordResetToken result = service.findById(tokenId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        when(repository.save(any(PasswordResetToken.class))).thenReturn(token);

        PasswordResetToken result = service.save(token);

        assertNotNull(result);
        assertEquals(tokenId, result.getTokenId());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(tokenId);

        verify(repository).deleteById(tokenId);
    }
}
