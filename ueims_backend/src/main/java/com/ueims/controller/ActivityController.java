package com.ueims.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.response.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    @PostMapping("/heartbeat")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> heartbeat() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.debug("Heartbeat from {}", auth != null ? auth.getName() : "anonymous");
        return ApiResponse.<Void>builder().message("ok").build();
    }

    @GetMapping("/ping")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> ping() {
        return ApiResponse.<Void>builder().message("pong").build();
    }
}
