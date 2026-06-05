package com.ueims.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.ueims.model.entity.InvalidatedToken;
import com.ueims.model.entity.UserSession;
import com.ueims.repository.InvalidatedTokenRepository;
import com.ueims.repository.UserSessionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserSessionManagementService {

    private final UserSessionRepository userSessionRepository;
    private final InvalidatedTokenRepository invalidatedTokenRepository;

    @Transactional
    public void invalidateOldSessions(String email) {
        List<UserSession> oldSessions = userSessionRepository.findByEmail(email);
        if (!CollectionUtils.isEmpty(oldSessions)) {
            List<InvalidatedToken> invalidTokens = oldSessions.stream()
                    .map(s -> InvalidatedToken.builder()
                            .tokenId(s.getTokenId())
                            .expiresAt(s.getExpiresAt())
                            .build())
                    .toList();
            invalidatedTokenRepository.saveAll(invalidTokens);
            userSessionRepository.deleteAll(oldSessions);
        }
    }
}
