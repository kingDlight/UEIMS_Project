package com.ueims.service;

import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.base-url:http://localhost:5173}")
    private String appBaseUrl;

    // ===== Password Reset (VI) =====
    public void sendPasswordResetMail(String to, String fullName, String token) {
        String resetUrl = appBaseUrl + "/reset-password?token=" + token;
        String subject = "Yêu cầu đặt lại mật khẩu — UEIMS";

        Context ctx = new Context();
        ctx.setVariable("fullName", fullName);
        ctx.setVariable("resetUrl", resetUrl);
        ctx.setVariable("subject", subject);

        String html = templateEngine.process("password-reset", ctx);
        sendHtml(to, subject, html);

        log.info("Email đặt lại mật khẩu đã được gửi đến: {}", to);
    }

    // ===== Welcome Email (VI) =====
    public void sendWelcomeMail(String to, String fullName, String tempPassword) {
        String loginUrl = appBaseUrl + "/login";
        String subject = "Chào mừng bạn đến với UEIMS";

        Context ctx = new Context();
        ctx.setVariable("fullName", fullName);
        ctx.setVariable("email", to);
        ctx.setVariable("tempPassword", tempPassword);
        ctx.setVariable("loginUrl", loginUrl);
        ctx.setVariable("subject", subject);

        String html = templateEngine.process("welcome", ctx);
        sendHtml(to, subject, html);

        log.info("Email chào mừng đã được gửi đến: {}", to);
    }

    // ===== Password Changed (VI) =====
    public void sendPasswordChangedMail(String to, String fullName, String changedAt) {
        String loginUrl = appBaseUrl + "/login";
        String subject = "Mật khẩu đã được thay đổi — UEIMS";

        Context ctx = new Context();
        ctx.setVariable("fullName", fullName);
        ctx.setVariable("changedAt", changedAt);
        ctx.setVariable("loginUrl", loginUrl);
        ctx.setVariable("subject", subject);

        String html = templateEngine.process("password-changed", ctx);
        sendHtml(to, subject, html);

        log.info("Email thông báo đổi mật khẩu đã được gửi đến: {}", to);
    }

    // ===== Late Report Warning (VI) =====
    public void sendLateReportWarningMail(String to, String fullName, Integer weekNumber) {
        String loginUrl = appBaseUrl + "/login";
        String subject = "Cảnh báo: Trễ hạn nộp báo cáo tuần " + weekNumber + " — UEIMS";

        Context ctx = new Context();
        ctx.setVariable("fullName", fullName);
        ctx.setVariable("weekNumber", weekNumber);
        ctx.setVariable("loginUrl", loginUrl);
        ctx.setVariable("subject", subject);

        String html = templateEngine.process("late-report-warning", ctx);
        sendHtml(to, subject, html);

        log.info("Email cảnh báo trễ báo cáo tuần {} đã được gửi đến: {}", weekNumber, to);
    }

    // ===== Internal sender =====
    private void sendHtml(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
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
