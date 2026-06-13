package com.ueims.service;

import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MailService {

    private static final String VAR_FULL_NAME = "fullName";
    private static final String VAR_SUBJECT = "subject";
    private static final String PATH_LOGIN = "/login";
    private static final String VAR_LOGIN_URL = "loginUrl";

    JavaMailSender javaMailSender;
    TemplateEngine templateEngine;

    @Value("${app.base-url:http://localhost:5173}")
    @NonFinal
    String appBaseUrl;

    // ===== Password Reset (VI) =====
    public void sendPasswordResetMail(String to, String fullName, String token) {
        String resetUrl = appBaseUrl + "/reset-password?token=" + token;
        String subject = "Yêu cầu đặt lại mật khẩu — UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("resetUrl", resetUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("password-reset", ctx);
        sendHtml(to, subject, html);

        log.info("Email đặt lại mật khẩu đã được gửi đến: {}", to);
    }

    // ===== Welcome Email (VI) =====
    public void sendWelcomeMail(String to, String fullName, String tempPassword) {
        String loginUrl = appBaseUrl + PATH_LOGIN;
        String subject = "Chào mừng bạn đến với UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("email", to);
        ctx.setVariable("tempPassword", tempPassword);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("welcome", ctx);
        sendHtml(to, subject, html);

        log.info("Email chào mừng đã được gửi đến: {}", to);
    }

    // ===== Password Changed (VI) =====
    public void sendPasswordChangedMail(String to, String fullName, String changedAt) {
        String loginUrl = appBaseUrl + PATH_LOGIN;
        String subject = "Mật khẩu đã được thay đổi — UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("changedAt", changedAt);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("password-changed", ctx);
        sendHtml(to, subject, html);

        log.info("Email thông báo đổi mật khẩu đã được gửi đến: {}", to);
    }

    // ===== Late Report Warning (VI) =====
    @org.springframework.scheduling.annotation.Async("mailTaskExecutor")
    public void sendLateReportWarningMail(String to, String fullName, Integer weekNumber) {
        String loginUrl = appBaseUrl + PATH_LOGIN;
        String subject = "Cảnh báo: Trễ hạn nộp báo cáo tuần " + weekNumber + " — UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("weekNumber", weekNumber);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("late-report-warning", ctx);
        sendHtml(to, subject, html);

        log.info("Email cảnh báo trễ báo cáo tuần {} đã được gửi đến: {}", weekNumber, to);
    }

    // ===== Enterprise Status Notification (UC-19) =====
    @org.springframework.scheduling.annotation.Async("mailTaskExecutor")
    public void sendEnterpriseStatusNotification(String to, String contactPerson, String status, String reason) {
        String subject = "Thông báo kết quả duyệt hồ sơ doanh nghiệp — UEIMS";
        String loginUrl = appBaseUrl + PATH_LOGIN;

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, contactPerson);
        ctx.setVariable("status", status);
        ctx.setVariable("reason", reason);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        // Giả định bạn sẽ tạo template enterprise-status.html trong folder templates
        String html = templateEngine.process("enterprise-status", ctx);
        sendHtml(to, subject, html);

        log.info("Email thông báo trạng thái {} đã được gửi tới doanh nghiệp: {}", status, to);
    }

    // ===== Interview Result Notification (UC-44) =====
    @org.springframework.scheduling.annotation.Async("mailTaskExecutor")
    public void sendInterviewResultMail(
            String to, String fullName, String enterpriseName, String result, String feedback) {
        String subject = "Thông báo kết quả phỏng vấn — " + enterpriseName;
        String loginUrl = appBaseUrl + PATH_LOGIN;

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("enterpriseName", enterpriseName);
        ctx.setVariable("result", result);
        ctx.setVariable("feedback", feedback);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("interview-result", ctx);
        sendHtml(to, subject, html);
    }

    private void sendHtml(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            org.springframework.core.io.ClassPathResource logoFile =
                    new org.springframework.core.io.ClassPathResource("logo_ueims.png");
            helper.addInline("logoImage", logoFile);

            javaMailSender.send(message);
        } catch (Exception e) {
            log.error("Gửi email thất bại đến {}: {}", to, e.getMessage());
            // Log body để debug
            log.warn("=== EMAIL BODY (fallback log) ===");
            log.warn("Gửi đến: {}", to);
            log.warn("Tiêu đề: {}", subject);
            log.warn("Body:\n{}", htmlBody);
            log.warn("==================================");
        }
    }
}
