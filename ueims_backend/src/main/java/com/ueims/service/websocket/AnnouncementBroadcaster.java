package com.ueims.service.websocket;

import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.ueims.dto.response.SystemAnnouncementDTO;
import com.ueims.model.entity.SystemAnnouncement;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Broadcasts system announcement lifecycle events (publish, archive, update,
 * delete) to {@code /topic/announcements}. Any authenticated user subscribed
 * to that topic will receive a real-time update so that views like
 * {@code SystemAnnouncementPage} can refresh automatically.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AnnouncementBroadcaster {

    public static final String TOPIC = "/topic/announcements";
    public static final String EVENT_PUBLISH = "PUBLISHED";
    public static final String EVENT_ARCHIVE = "ARCHIVED";
    public static final String EVENT_UPDATE = "UPDATED";
    public static final String EVENT_DELETE = "DELETED";
    public static final String EVENT_CREATE = "CREATED";

    SimpMessagingTemplate messagingTemplate;

    public void broadcastCreated(SystemAnnouncement announcement) {
        broadcast(announcement, EVENT_CREATE);
    }

    public void broadcastUpdated(SystemAnnouncement announcement) {
        broadcast(announcement, EVENT_UPDATE);
    }

    public void broadcastPublished(SystemAnnouncement announcement) {
        broadcast(announcement, EVENT_PUBLISH);
    }

    public void broadcastArchived(SystemAnnouncement announcement) {
        broadcast(announcement, EVENT_ARCHIVE);
    }

    public void broadcastDeleted(java.util.UUID announcementId) {
        try {
            messagingTemplate.convertAndSend(
                    TOPIC, Map.of("type", EVENT_DELETE, "announcementId", announcementId.toString()));
        } catch (Exception e) {
            log.debug("Failed to broadcast announcement delete: {}", e.getMessage());
        }
    }

    private void broadcast(SystemAnnouncement announcement, String event) {
        if (announcement == null) return;
        try {
            messagingTemplate.convertAndSend(
                    TOPIC, Map.of("type", event, "announcement", SystemAnnouncementDTO.from(announcement)));
        } catch (Exception e) {
            log.debug("Failed to broadcast announcement {}: {}", event, e.getMessage());
        }
    }
}
