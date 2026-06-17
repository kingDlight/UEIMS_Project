package com.ueims.config.security;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ueims.dto.response.ApiResponse;
import com.ueims.exception.ErrorCode;

public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(
            HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {
        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;

        Throwable cause = authException.getCause();
        if (cause instanceof org.springframework.security.oauth2.jwt.JwtException) {
            String msg = cause.getMessage();
            if ("Token has been invalidated".equals(msg)) {
                errorCode = ErrorCode.TOKEN_INVALIDATED;
            } else if ("Session expired due to inactivity".equals(msg)) {
                errorCode = ErrorCode.SESSION_EXPIRED;
            } else if (msg != null && msg.startsWith("Invalid token format")) {
                errorCode = ErrorCode.INVALID_TOKEN_FORMAT;
            }
        } else if (authException.getMessage() != null) {
            String msg = authException.getMessage();
            if (msg.contains("Token has been invalidated")) {
                errorCode = ErrorCode.TOKEN_INVALIDATED;
            } else if (msg.contains("Session expired due to inactivity")) {
                errorCode = ErrorCode.SESSION_EXPIRED;
            } else if (msg.contains("Invalid token format")) {
                errorCode = ErrorCode.INVALID_TOKEN_FORMAT;
            }
        }

        response.setHeader("WWW-Authenticate", "Bearer realm=\"UEIMS\"");
        response.setStatus(errorCode.getStatusCode().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        ObjectMapper objectMapper = new ObjectMapper();

        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        response.flushBuffer();
    }
}
