package com.ueims.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.dto.request.BroadcastNotificationRequest;
import com.ueims.model.entity.Interview;
import com.ueims.model.entity.Notification;
import com.ueims.model.entity.User;
import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.NotificationRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.NotificationService;
import com.ueims.service.websocket.NotificationBroadcaster;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationServiceImpl implements NotificationService {
    NotificationRepository repository;
    UserRepository userRepository;
    NotificationBroadcaster broadcaster;

    @Override
    public List<Notification> findAll() {
        return repository.findAll();
    }

    @Override
    public Notification findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Notification save(Notification entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public List<Notification> getMyNotifications(String email) {
        return repository.findByRecipient_EmailOrderByCreatedAtDesc(email);
    }

    @Override
    public long countUnreadForEmail(String email) {
        return repository.countByRecipient_EmailAndIsReadFalse(email);
    }

    @Override
    public int broadcast(BroadcastNotificationRequest req) {
        if (req == null || isBlank(req.getTitle()) || isBlank(req.getMessage())) {
            throw new IllegalArgumentException("title and message are required");
        }
        Set<UUID> recipientIds = new HashSet<>();
        if (req.getRecipientIds() != null) {
            recipientIds.addAll(req.getRecipientIds());
        }
        if (recipientIds.isEmpty()) {
            List<User> targets;
            if (req.getTargetRole() != null && !req.getTargetRole().isBlank()) {
                targets = userRepository.findActiveUsersByRoleName(
                        req.getTargetRole().trim());
            } else {
                targets = userRepository.findAll();
            }
            for (User u : targets) {
                if (u != null
                        && u.getUserId() != null
                        && u.getDeletedAt() == null
                        && (u.getStatus() == null || !"DISABLED".equalsIgnoreCase(u.getStatus()))) {
                    recipientIds.add(u.getUserId());
                }
            }
        }
        if (recipientIds.isEmpty()) {
            log.warn(
                    "[Notification] broadcast: no recipients resolved (role={}, explicit={})",
                    req.getTargetRole(),
                    req.getRecipientIds());
            return 0;
        }
        int sent = 0;
        for (UUID id : recipientIds) {
            User recipient = userRepository.findById(id).orElse(null);
            if (recipient == null) continue;
            try {
                Notification n = Notification.builder()
                        .recipient(recipient)
                        .type(req.getType() != null ? req.getType() : "GENERAL")
                        .title(req.getTitle())
                        .message(req.getMessage())
                        .referenceEntity(req.getReferenceEntity())
                        .referenceId(req.getReferenceId())
                        .isRead(false)
                        .build();
                Notification saved = repository.save(n);
                pushCreated(saved);
                sent++;
            } catch (Exception ex) {
                log.warn("[Notification] broadcast save failed for {}: {}", id, ex.getMessage());
            }
        }
        return sent;
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    @Override
    public Notification markAsRead(UUID id, String email) {
        Notification notification = repository
                .findByNotificationIdAndRecipient_Email(id, email)
                .orElseThrow(() -> new com.ueims.exception.ResourceNotFoundException("Notification not found"));
        if (Boolean.TRUE.equals(notification.getIsRead())) {
            return notification;
        }
        notification.setIsRead(true);
        Notification saved = repository.save(notification);
        broadcaster.pushUnreadCountToUser(email, repository.countByRecipient_EmailAndIsReadFalse(email));
        return saved;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public int markAllAsRead(String email) {
        int updated = repository.markAllAsReadForRecipient(email);
        if (updated > 0) {
            broadcaster.pushUnreadCountToUser(email, 0L);
        }
        return updated;
    }

    private void pushCreated(Notification n) {
        if (n == null || n.getRecipient() == null) return;
        String email = n.getRecipient().getEmail();
        broadcaster.pushToUser(email, n);
        broadcaster.pushUnreadCountToUser(email, repository.countByRecipient_EmailAndIsReadFalse(email));
    }

    private void notifyStudent(Interview interview, String type, String title, String message) {
        if (interview == null
                || interview.getApplication() == null
                || interview.getApplication().getStudent() == null) {
            return;
        }
        try {
            User student = userRepository
                    .findById(interview.getApplication().getStudent().getUserId())
                    .orElse(null);
            if (student == null) return;
            Notification n = Notification.builder()
                    .recipient(student)
                    .type(type)
                    .title(title)
                    .message(message)
                    .referenceEntity("INTERVIEW")
                    .referenceId(interview.getInterviewId())
                    .isRead(false)
                    .build();
            Notification saved = repository.save(n);
            pushCreated(saved);
        } catch (Exception ex) {
            log.warn("[Notification] Failed to save notification: {}", ex.getMessage());
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(
            propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void notifyInterviewScheduled(Interview interview) {
        notifyStudent(
                interview,
                "INTERVIEW_SCHEDULED",
                "Lịch phỏng vấn mới",
                "Bạn có buổi phỏng vấn mới. Vui lòng đăng nhập để xác nhận.");
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(
            propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void notifyInterviewRescheduled(Interview interview) {
        notifyStudent(
                interview,
                "INTERVIEW_RESCHEDULED",
                "Lịch phỏng vấn đã được dời",
                "Lịch phỏng vấn của bạn đã được cập nhật. Vui lòng kiểm tra thời gian mới.");
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(
            propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void notifyInterviewCanceled(Interview interview) {
        notifyStudent(
                interview,
                "INTERVIEW_CANCELED",
                "Lịch phỏng vấn đã bị hủy",
                "Buổi phỏng vấn của bạn đã bị hủy. Vui lòng liên hệ doanh nghiệp.");
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(
            propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void notifyInterviewResult(Interview interview) {
        String result = "PASS".equals(interview.getResult()) ? "ĐẬU" : "RỚT";
        notifyStudent(
                interview,
                "INTERVIEW_RESULT",
                "Kết quả phỏng vấn: " + result,
                "Đã có kết quả phỏng vấn. Vui lòng kiểm tra chi tiết trên hệ thống.");
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(
            propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void notifyWeeklyReportApproved(WeeklyReport report) {
        if (report == null
                || report.getAssignment() == null
                || report.getAssignment().getStudent() == null) return;
        try {
            User student = userRepository
                    .findById(report.getAssignment().getStudent().getUserId())
                    .orElse(null);
            if (student == null) return;
            Notification saved = repository.save(Notification.builder()
                    .recipient(student)
                    .type("WEEKLY_REPORT_APPROVED")
                    .title("Báo cáo tuần đã được duyệt")
                    .message("Báo cáo tuần của bạn đã được doanh nghiệp phê duyệt.")
                    .isRead(false)
                    .build());
            pushCreated(saved);
        } catch (Exception ex) {
            log.warn("[Notification] Failed to notify report approved: {}", ex.getMessage());
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(
            propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void notifyWeeklyReportRejected(WeeklyReport report, String feedback) {
        if (report == null
                || report.getAssignment() == null
                || report.getAssignment().getStudent() == null) return;
        try {
            User student = userRepository
                    .findById(report.getAssignment().getStudent().getUserId())
                    .orElse(null);
            if (student == null) return;
            Notification saved = repository.save(Notification.builder()
                    .recipient(student)
                    .type("WEEKLY_REPORT_REJECTED")
                    .title("Báo cáo tuần cần chỉnh sửa")
                    .message("Báo cáo tuần của bạn đã bị từ chối. Lý do: " + feedback)
                    .isRead(false)
                    .build());
            pushCreated(saved);
        } catch (Exception ex) {
            log.warn("[Notification] weekly report rejected save failed: {}", ex.getMessage());
        }
    }

    @Override
    public void notifyTrainingManagerOfIncident(com.ueims.model.entity.Incident incident) {
        if (incident == null) return;
        try {
            userRepository.findAll().stream()
                    .filter(u -> u.getRoles() != null
                            && u.getRoles().stream()
                                    .anyMatch(ur -> ur.getRole() != null
                                            && "TRAINING_MANAGER"
                                                    .equalsIgnoreCase(
                                                            ur.getRole().getRoleName())))
                    .forEach(tm -> {
                        try {
                            Notification saved = repository.save(Notification.builder()
                                    .recipient(tm)
                                    .type("INCIDENT")
                                    .title("Sự cố mới từ doanh nghiệp")
                                    .message("Một sự cố mới đã được báo cáo: " + incident.getCategory())
                                    .isRead(false)
                                    .build());
                            pushCreated(saved);
                        } catch (Exception ignored) {
                            // Ignore exceptions to ensure other notifications are sent
                        }
                    });
        } catch (Exception ex) {
            log.warn("[Notification] incident broadcast failed: {}", ex.getMessage());
        }
    }
}
