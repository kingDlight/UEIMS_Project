package com.ueims;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.ueims.service.MailService;

@SpringBootTest
public class ManualEmailTest {

    @Autowired
    private MailService mailService;

    @Test
    public void testSendEmail() throws Exception {
        String email = "youkervang999@gmail.com";
        String fullName = "Vang Youker";

        // Gửi email Đặt lại mật khẩu (có nút Đặt lại mật khẩu)
        mailService.sendPasswordResetMail(email, fullName, "sample-token-12345");

        // Gửi email Chào mừng (có nút Đăng nhập)
        mailService.sendWelcomeMail(email, fullName, "P@ssw0rd123");

        // Gửi email Đổi mật khẩu thành công (có nút Đăng nhập)
        mailService.sendPasswordChangedMail(email, fullName, "14:30, 25/06/2026");

        // Đợi background thread gửi mail
        Thread.sleep(10000);
    }
}
