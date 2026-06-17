package com.ueims.filter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ueims.model.entity.RequestLog;
import com.ueims.model.entity.RequestLog.HttpMethod;
import com.ueims.service.RequestLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(Ordered.LOWEST_PRECEDENCE - 10)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private final RequestLogService requestLogService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Set<String> SKIP_PATTERNS =
            Set.of("/api/auth/", "/actuator/", "/uploads/", "/static/", "/favicon", "/error");

    private static final Set<String> SKIP_EXTENSIONS = Set.of(
            ".js", ".css", ".ico", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".woff", ".woff2", ".ttf", ".eot", ".map",
            ".webp");

    private static final Path LOG_DIR = Paths.get("logs", "request");
    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter JSON_DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (shouldSkip(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();

        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            long responseTimeMs = System.currentTimeMillis() - startTime;
            int statusCode = wrappedResponse.getStatus();

            logToFile(request, wrappedResponse, statusCode, responseTimeMs);
            logToDb(request, statusCode, responseTimeMs);

            wrappedResponse.copyBodyToResponse();
        }
    }

    private boolean shouldSkip(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        for (String pattern : SKIP_PATTERNS) {
            if (path.startsWith(pattern)) return true;
        }

        int dotIndex = path.lastIndexOf('.');
        if (dotIndex >= 0) {
            String ext = path.substring(dotIndex);
            if (SKIP_EXTENSIONS.contains(ext.toLowerCase())) return true;
        }

        return false;
    }

    private void logToFile(
            HttpServletRequest request, ContentCachingResponseWrapper response, int statusCode, long responseTimeMs) {
        try {
            Files.createDirectories(LOG_DIR);

            String fileName = LocalDate.now().format(FILE_DATE_FORMAT) + ".json";
            Path logFile = LOG_DIR.resolve(fileName);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = (auth != null && !"anonymousUser".equals(auth.getPrincipal())) ? auth.getName() : null;
            String userId = extractUserId(auth);

            var entry = new java.util.LinkedHashMap<String, Object>();
            entry.put("ts", LocalDateTime.now().format(JSON_DATE_FORMAT));
            entry.put("uid", userId);
            entry.put("email", email);
            entry.put("method", request.getMethod());
            entry.put("endpoint", request.getRequestURI());
            entry.put("status", statusCode);
            entry.put("ms", responseTimeMs);
            entry.put("ip", getClientIpAddress(request));
            entry.put("ua", truncate(request.getHeader("User-Agent"), 300));

            String jsonLine = objectMapper.writeValueAsString(entry) + System.lineSeparator();

            synchronized (RequestLoggingFilter.class) {
                Files.writeString(
                        logFile,
                        jsonLine,
                        java.nio.file.StandardOpenOption.CREATE,
                        java.nio.file.StandardOpenOption.APPEND);
            }
        } catch (Exception e) {
            log.warn("Failed to write request log to file: {}", e.getMessage());
        }
    }

    private void logToDb(HttpServletRequest request, int statusCode, long responseTimeMs) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = (auth != null && !"anonymousUser".equals(auth.getPrincipal())) ? auth.getName() : null;
            UUID userId = extractUserIdParsed(auth);

            HttpMethod method;
            try {
                method = HttpMethod.valueOf(request.getMethod());
            } catch (IllegalArgumentException e) {
                method = HttpMethod.GET;
            }

            RequestLog requestLog = RequestLog.builder()
                    .userId(userId)
                    .userEmail(email)
                    .sessionId(
                            request.getSession(false) != null
                                    ? request.getSession().getId()
                                    : null)
                    .method(method)
                    .endpoint(request.getRequestURI())
                    .statusCode(statusCode)
                    .ipAddress(getClientIpAddress(request))
                    .userAgent(truncate(request.getHeader("User-Agent"), 500))
                    .responseTimeMs(responseTimeMs)
                    .build();

            requestLogService.logRequest(requestLog);
        } catch (Exception e) {
            log.warn("Failed to save request log to DB: {}", e.getMessage());
        }
    }

    private String extractUserId(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        return null;
    }

    private UUID extractUserIdParsed(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            try {
                return UUID.fromString(jwt.getSubject());
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private String truncate(String value, int maxLength) {
        if (value == null) return null;
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
