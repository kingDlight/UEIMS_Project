package com.ueims.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class MailService {

    private static final String VAR_FULL_NAME = "fullName";
    private static final String VAR_SUBJECT = "subject";
    private static final String PATH_LOGIN = "/login";
    private static final String VAR_LOGIN_URL = "loginUrl";

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.base-url:http://localhost:5173}")
    private String appBaseUrl;

    // ===== Password Reset =====
    public void sendPasswordResetMail(String to, String fullName, String token) {
        String resetUrl = appBaseUrl + "/reset-password?token=" + token;
        String subject = "Password Reset Request — UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("resetUrl", resetUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("password-reset", ctx);
        sendHtml(to, subject, html);

        log.info("Password reset email sent to: {}", to);
    }

    // ===== Welcome Email =====
    public void sendWelcomeMail(String to, String fullName, String tempPassword) {
        String loginUrl = appBaseUrl + PATH_LOGIN;
        String subject = "Welcome to UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("email", to);
        ctx.setVariable("tempPassword", tempPassword);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("welcome", ctx);
        sendHtml(to, subject, html);

        log.info("Welcome email sent to: {}", to);
    }

    // ===== Password Changed =====
    public void sendPasswordChangedMail(String to, String fullName, String changedAt) {
        String loginUrl = appBaseUrl + PATH_LOGIN;
        String subject = "Your password has been changed — UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("changedAt", changedAt);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("password-changed", ctx);
        sendHtml(to, subject, html);

        log.info("Password changed notification email sent to: {}", to);
    }

    // ===== Late Report Warning =====
    @org.springframework.scheduling.annotation.Async("mailTaskExecutor")
    public void sendLateReportWarningMail(String to, String fullName, Integer weekNumber) {
        String loginUrl = appBaseUrl + PATH_LOGIN;
        String subject = "Warning: Overdue Weekly Report " + weekNumber + " — UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("weekNumber", weekNumber);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("late-report-warning", ctx);
        sendHtml(to, subject, html);

        log.info("Late report warning email for week {} sent to: {}", weekNumber, to);
    }

    // ===== Enterprise Status Notification (UC-19) =====
    @org.springframework.scheduling.annotation.Async("mailTaskExecutor")
    public void sendEnterpriseStatusNotification(String to, String contactPerson, String status, String reason) {
        String subject = "Enterprise Registration Approval Result — UEIMS";
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

        log.info("Enterprise status notification email ({}) sent to: {}", status, to);
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
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            // Fallback log body for debugging
            log.warn("=== EMAIL BODY (fallback log) ===");
            log.warn("To: {}", to);
            log.warn("Subject: {}", subject);
            log.warn("Body:\n{}", htmlBody);
            log.warn("==================================");
        }
    }
}
