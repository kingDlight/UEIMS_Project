package com.ueims.service.impl;

import java.time.LocalDateTime;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.repository.InvalidatedTokenRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class InvalidatedTokenCleanupService {

    InvalidatedTokenRepository invalidatedTokenRepository;

    @Scheduled(cron = "0 0 0 * * ?")
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Starting cleanup of expired invalidated tokens...");
        LocalDateTime now = LocalDateTime.now();
        invalidatedTokenRepository.deleteAllByExpiresAtBefore(now);
        log.info("Completed cleanup of expired invalidated tokens.");
    }
}
