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
    @Query("SELECT n FROM Notification n WHERE n.recipient.email = :email ORDER BY n.createdAt DESC")
    List<Notification> findByRecipient_EmailOrderByCreatedAtDesc(@Param("email") String email);

    Optional<Notification> findByNotificationIdAndRecipient_Email(UUID notificationId, String email);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient.email = :email AND n.isRead = false")
    long countByRecipient_EmailAndIsReadFalse(@Param("email") String email);

    @Modifying
    @Query("update Notification n set n.isRead = true where n.recipient.email = :email and n.isRead = false")
    int markAllAsReadForRecipient(@Param("email") String email);
}
