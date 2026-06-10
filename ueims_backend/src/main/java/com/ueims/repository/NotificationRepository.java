package com.ueims.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipient_EmailOrderByCreatedAtDesc(String email);

    Optional<Notification> findByNotificationIdAndRecipient_Email(UUID notificationId, String email);
}
