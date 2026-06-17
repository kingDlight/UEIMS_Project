package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.BroadcastNotificationRequest;
import com.ueims.model.entity.Interview;
import com.ueims.model.entity.Notification;
import com.ueims.model.entity.WeeklyReport;

public interface NotificationService {
    List<Notification> findAll();

    Notification findById(UUID id);

    Notification save(Notification entity);

    void deleteById(UUID id);

    List<Notification> getMyNotifications(String email);

    long countUnreadForEmail(String email);

    Notification markAsRead(UUID id, String email);

    /**
     * Send a notification to one or more recipients. When {@code recipientIds}
     * is empty, {@code targetRole} is used to filter; when both are null,
     * the notification is sent to every active user in the system.
     *
     * @return number of notifications actually persisted
     */
    int broadcast(BroadcastNotificationRequest request);

    // ===== Convenience hooks for domain events (UC-43 / UC-44 / UC-48 / UC-49) =====
    void notifyInterviewScheduled(Interview interview);

    void notifyInterviewRescheduled(Interview interview);

    void notifyInterviewCanceled(Interview interview);

    void notifyInterviewResult(Interview interview);

    void notifyWeeklyReportApproved(WeeklyReport report);

    void notifyWeeklyReportRejected(WeeklyReport report, String feedback);

    void notifyTrainingManagerOfIncident(com.ueims.model.entity.Incident incident);
}
