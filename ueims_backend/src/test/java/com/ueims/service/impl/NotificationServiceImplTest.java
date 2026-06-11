package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
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

import com.ueims.exception.ResourceNotFoundException;
import com.ueims.model.entity.Notification;
import com.ueims.repository.NotificationRepository;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    private static final String TEST_EMAIL = "user@test.com";

    @Mock
    private NotificationRepository repository;

    @InjectMocks
    private NotificationServiceImpl service;

    private Notification notification;
    private UUID notificationId;

    @BeforeEach
    void setUp() {
        notificationId = UUID.randomUUID();
        notification = Notification.builder()
                .notificationId(notificationId)
                .title("Test Title")
                .message("Test Content")
                .isRead(false)
                .build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(notification));

        List<Notification> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(notificationId, result.get(0).getNotificationId());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(notificationId)).thenReturn(Optional.of(notification));

        Notification result = service.findById(notificationId);

        assertNotNull(result);
        assertEquals(notificationId, result.getNotificationId());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(notificationId)).thenReturn(Optional.empty());

        Notification result = service.findById(notificationId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        when(repository.save(any(Notification.class))).thenReturn(notification);

        Notification result = service.save(notification);

        assertNotNull(result);
        assertEquals(notificationId, result.getNotificationId());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(notificationId);

        verify(repository).deleteById(notificationId);
    }

    @Test
    void getMyNotificationsSuccess() {
        when(repository.findByRecipient_EmailOrderByCreatedAtDesc(TEST_EMAIL)).thenReturn(List.of(notification));

        List<Notification> result = service.getMyNotifications(TEST_EMAIL);

        assertEquals(1, result.size());
        assertEquals(notificationId, result.get(0).getNotificationId());
    }

    @Test
    void markAsReadSuccess() {
        when(repository.findByNotificationIdAndRecipient_Email(notificationId, TEST_EMAIL))
                .thenReturn(Optional.of(notification));
        when(repository.save(any(Notification.class))).thenReturn(notification);

        Notification result = service.markAsRead(notificationId, TEST_EMAIL);

        assertNotNull(result);
        assertTrue(result.getIsRead());
    }

    @Test
    void markAsReadNotFoundThrowsException() {
        when(repository.findByNotificationIdAndRecipient_Email(notificationId, TEST_EMAIL))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(ResourceNotFoundException.class, () -> service.markAsRead(notificationId, TEST_EMAIL));

        assertEquals("Notification not found", exception.getMessage());
    }
}
