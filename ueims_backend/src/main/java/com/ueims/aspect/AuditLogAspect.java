package com.ueims.aspect;

import java.time.LocalDateTime;

import jakarta.servlet.http.HttpServletRequest;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.ueims.model.entity.AuditLog;
import com.ueims.model.entity.User;
import com.ueims.repository.AuditLogRepository;
import com.ueims.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLogAspect {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    // BR-07: Automatically capture all mutating actions (POST, PUT, DELETE)
    @Pointcut("@annotation(org.springframework.web.bind.annotation.PostMapping) || "
            + "@annotation(org.springframework.web.bind.annotation.PutMapping) || "
            + "@annotation(org.springframework.web.bind.annotation.DeleteMapping)")
    public void mutatingEndpoints() {
    }

    // Exclude AuthController and AuditLogController to avoid loops or redundant
    // auth logs
    @Pointcut("!within(com.ueims.controller.AuthenticationController) && "
            + "!within(com.ueims.controller.AuditLogController)")
    public void excludedControllers() {
    }

    @AfterReturning(pointcut = "mutatingEndpoints() && excludedControllers()", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = (authentication != null) ? authentication.getName() : "anonymous";

            User user = null;
            if (!"anonymous".equals(email) && !"anonymousUser".equals(email)) {
                user = userRepository.findByEmail(email).orElse(null);
            }

            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            String ipAddress = "Unknown";
            String userAgent = "Unknown";
            String targetEntity = joinPoint.getSignature().getDeclaringType().getSimpleName().replace("Controller", "");
            String action = joinPoint.getSignature().getName().toUpperCase();

            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                ipAddress = request.getRemoteAddr();
                userAgent = request.getHeader("User-Agent");
                String method = request.getMethod();
                action = method + "_" + action;
            }

            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .targetEntity(targetEntity)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .timestamp(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log saved automatically for action: {} by {}", action, email);

        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }
}
