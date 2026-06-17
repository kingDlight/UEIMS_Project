package com.ueims.service.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.ueims.dto.response.RequestLogResponseDTO;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Pushes request-log events to all admin WebSocket subscribers.
 * The frontend subscribes to {@code /topic/request-logs} and prepends
 * incoming entries to the live table.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RequestLogBroadcaster {

    public static final String TOPIC = "/topic/request-logs";

    SimpMessagingTemplate messagingTemplate;

    public void broadcast(RequestLogResponseDTO dto) {
        try {
            messagingTemplate.convertAndSend(TOPIC, dto);
        } catch (Exception e) {
            log.debug("Failed to broadcast request log: {}", e.getMessage());
        }
    }
}
