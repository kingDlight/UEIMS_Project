package com.ueims.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MailService {

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    public void sendPasswordResetMail(String to, String token) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        String subject = "UEIMS - Đặt lại mật khẩu";
        String text =
                "Xin chào,\n\nBạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết dưới đây để thiết lập mật khẩu mới (có hiệu lực trong 15 phút):\n\n"
                        + resetUrl + "\n\nNếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.";

        if (javaMailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(text);
                javaMailSender.send(message);
                log.info("Email đặt lại mật khẩu đã được gửi thành công đến: {}", to);
                return;
            } catch (Exception e) {
                log.error("Lỗi khi gửi email qua SMTP, chuyển sang chế độ Mock. Lỗi: {}", e.getMessage());
            }
        }

        // Fallback to Mock Mail if SMTP is not configured or fails
        log.warn("=== MOCK MAIL SENDER ===");
        log.warn("Gửi đến: {}", to);
        log.warn("Tiêu đề: {}", subject);
        log.warn("Nội dung:\n{}", text);
        log.warn("========================");
    }
}
