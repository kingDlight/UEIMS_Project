package com.ueims.config.security;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Adds HTTP security headers to every response.
 *
 * Headers added:
 * - X-Content-Type-Options: prevents MIME-type sniffing
 * - X-Frame-Options: prevents clickjacking
 * - X-XSS-Protection: legacy XSS filter hint for older browsers
 * - Referrer-Policy: limits referrer info leakage
 * - Permissions-Policy: disables sensitive browser features
 * - Cache-Control: prevents caching of API responses
 */
@Component
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Prevent MIME sniffing
        response.setHeader("X-Content-Type-Options", "nosniff");

        // Prevent clickjacking
        response.setHeader("X-Frame-Options", "DENY");

        // Legacy XSS protection for IE/old Chrome
        response.setHeader("X-XSS-Protection", "1; mode=block");

        // Referrer policy
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Disable unnecessary browser features
        response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

        // No caching of API responses
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");

        filterChain.doFilter(request, response);
    }

    /** Apply only to /api/** and /uploads/** paths */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/") && !path.startsWith("/uploads/");
    }
}
