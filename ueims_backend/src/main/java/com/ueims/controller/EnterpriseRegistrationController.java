package com.ueims.controller;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.request.EnterpriseRegistrationRequest;
import com.ueims.dto.response.ApiResponse;
import com.ueims.service.EnterpriseRegistrationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EnterpriseRegistrationController {
    EnterpriseRegistrationService registrationService;

    @PostMapping("/register-enterprise")
    public ApiResponse<Void> registerEnterprise(@Valid @RequestBody EnterpriseRegistrationRequest request) {
        registrationService.register(request);
        return ApiResponse.<Void>builder()
                .code(1036)
                .message(
                        "Registration successful. Your account will be activated after the Training Manager approves it.")
                .build();
    }
}
