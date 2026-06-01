package com.ueims.controller;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.request.EnterpriseRegistrationRequest;
import com.ueims.dto.response.ApiResponse;
import com.ueims.service.EnterpriseRegistrationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class EnterpriseRegistrationController {
    private final EnterpriseRegistrationService registrationService;

    @PostMapping("/register-enterprise")
    public ApiResponse<Void> registerEnterprise(@Valid @RequestBody EnterpriseRegistrationRequest request) {
        registrationService.register(request);
        return ApiResponse.<Void>builder()
                .code(1036)
                .message("Đăng ký thành công. Tài khoản sẽ được kích hoạt sau khi Training Manager phê duyệt.")
                .build();
    }
}
