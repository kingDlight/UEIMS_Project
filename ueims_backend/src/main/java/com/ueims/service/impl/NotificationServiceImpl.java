package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.Interview;
import com.ueims.model.entity.Notification;
import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.NotificationRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.NotificationService;

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
    public Notification markAsRead(UUID id, String email) {
        Notification notification = repository
                .findByNotificationIdAndRecipient_Email(id, email)
                .orElseThrow(() -> new com.ueims.exception.ResourceNotFoundException("Notification not found"));
        notification.setIsRead(true);
        return repository.save(notification);
    }

    private void notifyStudent(Interview interview, String type, String title, String message) {
        if (interview == null
                || interview.getApplication() == null
                || interview.getApplication().getStudent() == null) {
            return;
        }
        try {
            Notification n = Notification.builder()
                    .recipient(interview.getApplication().getStudent())
                    .type(type)
                    .title(title)
                    .message(message)
                    .isRead(false)
                    .build();
            repository.save(n);
        } catch (Exception ex) {
            log.warn("[Notification] Failed to save notification: {}", ex.getMessage());
        }
    }

    @Override
    public void notifyInterviewScheduled(Interview interview) {
        notifyStudent(
                interview,
                "INTERVIEW_SCHEDULED",
                "Lịch phỏng vấn mới",
                "Bạn có buổi phỏng vấn mới. Vui lòng đăng nhập để xác nhận.");
    }

    @Override
    public void notifyInterviewRescheduled(Interview interview) {
        notifyStudent(
                interview,
                "INTERVIEW_RESCHEDULED",
                "Lịch phỏng vấn đã được dời",
                "Lịch phỏng vấn của bạn đã được cập nhật. Vui lòng kiểm tra thời gian mới.");
    }

    @Override
    public void notifyInterviewCanceled(Interview interview) {
        notifyStudent(
                interview,
                "INTERVIEW_CANCELED",
                "Lịch phỏng vấn đã bị hủy",
                "Buổi phỏng vấn của bạn đã bị hủy. Vui lòng liên hệ doanh nghiệp.");
    }

    @Override
    public void notifyInterviewResult(Interview interview) {
        String result = interview.getResult();
        String title = "PASS".equalsIgnoreCase(result) ? "Chúc mừng — Bạn đã vượt qua phỏng vấn" : "Kết quả phỏng vấn";
        String message = "PASS".equalsIgnoreCase(result)
                ? "Bạn đã được doanh nghiệp lựa chọn. Vui lòng theo dõi các bước tiếp theo."
                : "Cảm ơn bạn đã tham gia. Hãy tiếp tục tìm kiếm cơ hội khác.";
        notifyStudent(interview, "INTERVIEW_RESULT", title, message);
    }

    @Override
    public void notifyWeeklyReportApproved(WeeklyReport report) {
        if (report == null
                || report.getAssignment() == null
                || report.getAssignment().getStudent() == null) return;
        try {
            repository.save(Notification.builder()
                    .recipient(report.getAssignment().getStudent())
                    .type("WEEKLY_REPORT_APPROVED")
                    .title("Báo cáo tuần đã được duyệt")
                    .message("Báo cáo tuần của bạn đã được doanh nghiệp phê duyệt.")
                    .isRead(false)
                    .build());
        } catch (Exception ex) {
            log.warn("[Notification] weekly report approved save failed: {}", ex.getMessage());
        }
    }

    @Override
    public void notifyWeeklyReportRejected(WeeklyReport report, String feedback) {
        if (report == null
                || report.getAssignment() == null
                || report.getAssignment().getStudent() == null) return;
        try {
            repository.save(Notification.builder()
                    .recipient(report.getAssignment().getStudent())
                    .type("WEEKLY_REPORT_REJECTED")
                    .title("Báo cáo tuần cần chỉnh sửa")
                    .message("Báo cáo tuần của bạn đã bị từ chối. Lý do: " + feedback)
                    .isRead(false)
                    .build());
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
                            repository.save(Notification.builder()
                                    .recipient(tm)
                                    .type("INCIDENT_REPORTED")
                                    .title("Sự cố mới từ doanh nghiệp")
                                    .message("Một sự cố mới đã được báo cáo: " + incident.getCategory())
                                    .isRead(false)
                                    .build());
                        } catch (Exception ignored) {
                            // Ignore exceptions to ensure other notifications are sent
                        }
                    });
        } catch (Exception ex) {
            log.warn("[Notification] incident broadcast failed: {}", ex.getMessage());
        }
    }
}
