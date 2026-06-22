package com.ueims.service.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.ueims.model.entity.Notification;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Pushes notification events to a single recipient's WebSocket session.
 *
 * <p>The frontend subscribes to the user-scoped destination
 * {@code /user/queue/notifications} (STOMP auto-rewrites the user prefix).
 * Each connected user only receives their own notifications.
 *
 * <p>A second broadcast is sent to {@code /topic/announcements} for the
 * notification entity so badges that listen on the global announcement
 * topic can refresh their data.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationBroadcaster {

    /** Per-user destination. STOMP auto-prefixes with the auth name. */
    public static final String USER_DESTINATION = "/queue/notifications";

    SimpMessagingTemplate messagingTemplate;
    com.ueims.mapper.NotificationMapper notificationMapper;

    public void pushToUser(String userEmail, Notification notification) {
        if (userEmail == null || notification == null) return;
        try {
            com.ueims.dto.response.NotificationDTO dto = notificationMapper.toDto(notification);
            messagingTemplate.convertAndSendToUser(userEmail, USER_DESTINATION, dto);
        } catch (Exception e) {
            log.debug("Failed to push notification to user {}: {}", userEmail, e.getMessage());
        }
    }

    public void pushUnreadCountToUser(String userEmail, long unread) {
        if (userEmail == null) return;
        try {
            messagingTemplate.convertAndSendToUser(
                    userEmail, USER_DESTINATION, java.util.Map.of("type", "unread-count", "count", unread));
        } catch (Exception e) {
            log.debug("Failed to push unread count to user {}: {}", userEmail, e.getMessage());
        }
    }
}
