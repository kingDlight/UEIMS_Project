package com.ueims.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.service.MailService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailTestController {

    private static final String KEY_FULL_NAME = "fullName";
    private static final String KEY_STATUS = "status";
    private static final String KEY_TEMPLATE = "template";

    MailService mailService;

    /**
     * POST /api/test/email/password-reset
     * Body: { "to": "test@example.com", "fullName": "Nguyen Van A" }
     */
    @PostMapping("/email/password-reset")
    public ResponseEntity<Map<String, String>> testPasswordReset(@RequestBody Map<String, String> body) {
        mailService.sendPasswordResetMail(body.get("to"), body.get(KEY_FULL_NAME), "test-token-123456");
        return ResponseEntity.ok(Map.of(KEY_STATUS, "sent", KEY_TEMPLATE, "password-reset"));
    }

    /**
     * POST /api/test/email/welcome
     * Body: { "to": "test@example.com", "fullName": "Nguyen Van A", "tempPassword": "TmpP@ss123" }
     */
    @PostMapping("/email/welcome")
    public ResponseEntity<Map<String, String>> testWelcome(@RequestBody Map<String, String> body) {
        mailService.sendWelcomeMail(body.get("to"), body.get(KEY_FULL_NAME), body.get("tempPassword"));
        return ResponseEntity.ok(Map.of(KEY_STATUS, "sent", KEY_TEMPLATE, "welcome"));
    }

    /**
     * POST /api/test/email/password-changed
     * Body: { "to": "test@example.com", "fullName": "Nguyen Van A", "changedAt": "01/06/2026 10:15" }
     */
    @PostMapping("/email/password-changed")
    public ResponseEntity<Map<String, String>> testPasswordChanged(@RequestBody Map<String, String> body) {
        mailService.sendPasswordChangedMail(body.get("to"), body.get(KEY_FULL_NAME), body.get("changedAt"));
        return ResponseEntity.ok(Map.of(KEY_STATUS, "sent", KEY_TEMPLATE, "password-changed"));
    }
}
