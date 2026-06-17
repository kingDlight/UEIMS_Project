package com.ueims.controller;

import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.response.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    /**
     * Records that the current user opened a page. The optional {@code page}
     * field is the client-side pathname (e.g. "/", "/admin/dashboard"). The
     * endpoint logs the page via the standard {@code RequestLoggingFilter},
     * so admins can see exactly which page a user is on.
     */
    @PostMapping("/page-view")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> pageView(@RequestBody(required = false) Map<String, String> body) {
        String page = body != null ? body.get("page") : null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.debug("Page view '{}' from {}", page, auth != null ? auth.getName() : "anonymous");
        return ApiResponse.<Void>builder().message("ok").build();
    }

    @GetMapping("/ping")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> ping() {
        return ApiResponse.<Void>builder().message("pong").build();
    }
}
