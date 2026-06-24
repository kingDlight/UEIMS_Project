package com.ueims.config.security;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ueims.dto.response.ApiResponse;
import com.ueims.exception.ErrorCode;

import lombok.extern.slf4j.Slf4j;

/**
 * Rate limiter for sensitive auth endpoints.
 * Allows at most MAX_REQUESTS requests per IP per WINDOW_MS milliseconds.
 * Uses a simple sliding-window counter stored in a ConcurrentHashMap.
 * No external dependency required.
 */
@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    /** Max requests per IP per window. */
    private static final int MAX_REQUESTS = 100;

    /** Window size in milliseconds (1 minute). */
    private static final long WINDOW_MS = TimeUnit.MINUTES.toMillis(1);

    /** Endpoints subject to rate limiting. */
    private static final String[] RATE_LIMITED_PATHS = {
        "/api/auth/token",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/api/auth/google",
        "/api/auth/register-enterprise"
    };

    /** Per-IP counters: ip -> [count, windowStartMs]. */
    private final Map<String, long[]> ipCounters = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        boolean shouldLimit = false;
        for (String limited : RATE_LIMITED_PATHS) {
            if (path.startsWith(limited)) {
                shouldLimit = true;
                break;
            }
        }

        if (!shouldLimit) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = resolveClientIp(request);
        long now = System.currentTimeMillis();

        long[] counter = ipCounters.compute(ip, (key, val) -> {
            if (val == null || now - val[1] > WINDOW_MS) {
                // New window
                return new long[] {1, now};
            }
            val[0]++;
            return val;
        });

        long count = counter[0];

        if (count > MAX_REQUESTS) {
            log.warn("Rate limit exceeded for IP={} on path={} count={}", ip, path, count);
            sendRateLimitResponse(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void sendRateLimitResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(ErrorCode.RATE_LIMIT_EXCEEDED.getCode())
                .message(ErrorCode.RATE_LIMIT_EXCEEDED.getMessage())
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }

    /** Resolves real client IP, accounting for reverse proxies. */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
