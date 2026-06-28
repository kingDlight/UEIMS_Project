package com.ueims.service.impl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.StringTemplateResolver;

@ExtendWith(MockitoExtension.class)
class MailServiceImplTest {

    private static final String TEST_EMAIL = "test@test.com";
    private static final String TEST_USER = "Test User";

    @Mock
    private JavaMailSender javaMailSender;

    private MailServiceImpl mailService;

    private MimeMessage mimeMessage;

    @BeforeEach
    void setUp() {
        TemplateEngine templateEngine = new SpringTemplateEngine();
        StringTemplateResolver resolver = new StringTemplateResolver();
        templateEngine.setTemplateResolver(resolver);

        mailService = new MailServiceImpl(javaMailSender, templateEngine);

        mimeMessage = new JavaMailSenderImpl().createMimeMessage();

        // reflection property if needed
        ReflectionTestUtils.setField(mailService, "appBaseUrl", "http://localhost:5173");
    }

    @Test
    void sendPasswordResetMailSuccess() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        mailService.sendPasswordResetMail(TEST_EMAIL, TEST_USER, "dummyToken");

        verify(javaMailSender).send(mimeMessage);
    }

    @Test
    void sendWelcomeMailSuccess() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        mailService.sendWelcomeMail(TEST_EMAIL, TEST_USER, "tempPassword");

        verify(javaMailSender).send(mimeMessage);
    }

    @Test
    void sendPasswordChangedMailSuccess() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        mailService.sendPasswordChangedMail(TEST_EMAIL, TEST_USER, "2023-01-01 10:00:00");

        verify(javaMailSender).send(mimeMessage);
    }

    @Test
    void sendLateReportWarningMailSuccess() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        mailService.sendLateReportWarningMail(TEST_EMAIL, TEST_USER, 5);

        verify(javaMailSender).send(mimeMessage);
    }

    @Test
    void sendEnterpriseStatusNotificationSuccess() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        mailService.sendEnterpriseStatusNotification(TEST_EMAIL, "Contact Person", "APPROVED", "All good");

        verify(javaMailSender).send(mimeMessage);
    }

    @Test
    void sendHtmlThrowsExceptionFallbackLog() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        doThrow(new RuntimeException("Mail server error")).when(javaMailSender).send(any(MimeMessage.class));

        // This should catch the exception and log it, rather than re-throwing
        mailService.sendWelcomeMail(TEST_EMAIL, TEST_USER, "tempPassword");

        verify(javaMailSender).send(mimeMessage);
    }
}
