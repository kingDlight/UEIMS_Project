package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.model.entity.InvalidatedToken;
import com.ueims.repository.InvalidatedTokenRepository;

@ExtendWith(MockitoExtension.class)
class InvalidatedTokenServiceImplTest {

    @Mock
    private InvalidatedTokenRepository repository;

    @InjectMocks
    private InvalidatedTokenServiceImpl service;

    private InvalidatedToken token;
    private String tokenId;

    @BeforeEach
    void setUp() {
        tokenId = "test-token-id";
        token = InvalidatedToken.builder()
                .tokenId(tokenId)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(token));

        List<InvalidatedToken> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(tokenId, result.get(0).getTokenId());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(tokenId)).thenReturn(Optional.of(token));

        InvalidatedToken result = service.findById(tokenId);

        assertNotNull(result);
        assertEquals(tokenId, result.getTokenId());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(tokenId)).thenReturn(Optional.empty());

        InvalidatedToken result = service.findById(tokenId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        when(repository.save(any(InvalidatedToken.class))).thenReturn(token);

        InvalidatedToken result = service.save(token);

        assertNotNull(result);
        assertEquals(tokenId, result.getTokenId());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(tokenId);

        verify(repository).deleteById(tokenId);
    }
}
