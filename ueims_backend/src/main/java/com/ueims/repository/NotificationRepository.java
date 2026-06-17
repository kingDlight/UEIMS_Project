package com.ueims.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipient_EmailOrderByCreatedAtDesc(String email);

    Optional<Notification> findByNotificationIdAndRecipient_Email(UUID notificationId, String email);

    long countByRecipient_EmailAndIsReadFalse(String email);

    @Modifying
    @Query("update Notification n set n.isRead = true where n.recipient.email = :email and n.isRead = false")
    int markAllAsReadForRecipient(@Param("email") String email);
}
