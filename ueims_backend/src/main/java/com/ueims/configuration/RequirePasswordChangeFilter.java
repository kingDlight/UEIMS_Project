package com.ueims.configuration;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ueims.dto.response.ApiResponse;
import com.ueims.exception.ErrorCode;

@Component
public class RequirePasswordChangeFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip check for auth endpoints except change-password
        if (path.startsWith("/api/auth/") && !path.equals("/api/auth/change-password")) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            Boolean mustChange = jwt.getClaim("must_change_password");

            if (Boolean.TRUE.equals(mustChange) && !path.equals("/api/auth/change-password")) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");

                ApiResponse<?> apiResponse = ApiResponse.builder()
                        .code(ErrorCode.UNAUTHORIZED.getCode())
                        .message("Bạn phải đổi mật khẩu ở lần đăng nhập đầu tiên.")
                        .build();

                ObjectMapper mapper = new ObjectMapper();
                response.getWriter().write(mapper.writeValueAsString(apiResponse));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
