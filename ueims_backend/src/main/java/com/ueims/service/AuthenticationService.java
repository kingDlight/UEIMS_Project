package com.ueims.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.ueims.dto.request.AuthenticationRequest;
import com.ueims.dto.request.ChangePasswordRequest;
import com.ueims.dto.request.IntrospectRequest;
import com.ueims.dto.request.LogoutRequest;
import com.ueims.dto.request.RefreshRequest;
import com.ueims.dto.response.AuthenticationResponse;
import com.ueims.dto.response.IntrospectResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.InvalidatedToken;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserSession;
import com.ueims.repository.InvalidatedTokenRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.UserSessionRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    UserSessionRepository userSessionRepository;
    com.ueims.repository.AuditLogRepository auditLogRepository;
    com.ueims.repository.PasswordResetTokenRepository passwordResetTokenRepository;
    MailService mailService;
    PasswordEncoder passwordEncoder;
    UserSessionManagementService userSessionManagementService;

    @NonFinal
    @Value("${jwt.signerKey}")
    private String signerKey;

    @NonFinal
    @Value("${jwt.valid-duration}")
    private long validDuration;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    private long refreshableDuration;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token, false);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.info("SignKey: {}", signerKey);

        var user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if ("LOCKED".equals(user.getStatus())) {
            throw new AppException(ErrorCode.USER_BANNED);
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(java.time.LocalDateTime.now())) {
            throw new AppException(ErrorCode.USER_BANNED);
        } else if (user.getLockedUntil() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.updateLoginAttemptsAndStatus(user.getUserId(), 0, user.getStatus(), null);
        }

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!authenticated) {
            // Tăng bộ đếm và lưu TRỰC TIẾP bằng SQL, bỏ qua Hibernate
            int attempts = user.getFailedLoginAttempts() + 1;
            java.time.LocalDateTime lockedUntil = null;
            if (attempts >= 5) {
                lockedUntil = java.time.LocalDateTime.now().plusMinutes(30);
            }
            userRepository.updateLoginAttemptsAndStatus(user.getUserId(), attempts, user.getStatus(), lockedUntil);

            if (attempts >= 5) {
                throw new AppException(ErrorCode.USER_BANNED);
            }
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Đăng nhập thành công → Reset bộ đếm
        if (user.getFailedLoginAttempts() > 0) {
            userRepository.updateLoginAttemptsAndStatus(user.getUserId(), 0, user.getStatus(), null);
        }

        // BR-02: Simultaneous Session Control - Invalidate old sessions
        userSessionManagementService.invalidateOldSessions(user.getEmail());

        var token = generateToken(user, validDuration, false);
        var refreshToken = generateToken(user, refreshableDuration, true);

        // Save new sessions for BOTH access token and refresh token
        try {
            SignedJWT signedAccessJWT = SignedJWT.parse(token);
            UserSession accessSession = UserSession.builder()
                    .tokenId(signedAccessJWT.getJWTClaimsSet().getJWTID())
                    .email(user.getEmail())
                    .expiresAt(signedAccessJWT
                            .getJWTClaimsSet()
                            .getExpirationTime()
                            .toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime())
                    .build();
            userSessionRepository.save(accessSession);

            SignedJWT signedRefreshJWT = SignedJWT.parse(refreshToken);
            UserSession refreshSession = UserSession.builder()
                    .tokenId(signedRefreshJWT.getJWTClaimsSet().getJWTID())
                    .email(user.getEmail())
                    .expiresAt(signedRefreshJWT
                            .getJWTClaimsSet()
                            .getExpirationTime()
                            .toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime())
                    .build();
            userSessionRepository.save(refreshSession);

            // BR-05 / Security: Log the successful login
            jakarta.servlet.http.HttpServletRequest httpRequest =
                    ((org.springframework.web.context.request.ServletRequestAttributes)
                                    org.springframework.web.context.request.RequestContextHolder.getRequestAttributes())
                            .getRequest();

            com.ueims.model.entity.AuditLog auditLog = com.ueims.model.entity.AuditLog.builder()
                    .user(user)
                    .action("LOGIN_SUCCESS")
                    .targetEntity("User")
                    .targetId(user.getUserId())
                    .ipAddress(httpRequest.getRemoteAddr())
                    .userAgent(httpRequest.getHeader("User-Agent"))
                    .build();
            auditLogRepository.save(auditLog);

        } catch (ParseException e) {
            log.error("Failed to parse generated token", e);
        }

        return AuthenticationResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .authenticated(true)
                .mustChangePassword(user.getMustChangePassword())
                .build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        try {
            var signToken = verifyToken(request.getToken(), false);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .tokenId(jit)
                    .expiresAt(expiryTime
                            .toInstant()
                            .atZone(java.time.ZoneId.systemDefault())
                            .toLocalDateTime())
                    .build();

            invalidatedTokenRepository.save(invalidatedToken);
            userSessionRepository.findById(jit).ifPresent(userSessionRepository::delete);
        } catch (AppException exception) {
            log.info("Token already expired");
        }
    }

    @Transactional
    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken(), true);

        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .tokenId(jit)
                .expiresAt(expiryTime
                        .toInstant()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDateTime())
                .build();

        invalidatedTokenRepository.save(invalidatedToken);
        userSessionRepository.findById(jit).ifPresent(userSessionRepository::delete);

        var email = signedJWT.getJWTClaimsSet().getSubject();

        var user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        var token = generateToken(user, validDuration, false);
        var newRefreshToken = generateToken(user, refreshableDuration, true);

        try {
            SignedJWT parsedToken = SignedJWT.parse(token);
            UserSession accessSession = UserSession.builder()
                    .tokenId(parsedToken.getJWTClaimsSet().getJWTID())
                    .email(user.getEmail())
                    .expiresAt(parsedToken
                            .getJWTClaimsSet()
                            .getExpirationTime()
                            .toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime())
                    .build();
            userSessionRepository.save(accessSession);

            SignedJWT parsedRefreshToken = SignedJWT.parse(newRefreshToken);
            UserSession refreshSession = UserSession.builder()
                    .tokenId(parsedRefreshToken.getJWTClaimsSet().getJWTID())
                    .email(user.getEmail())
                    .expiresAt(parsedRefreshToken
                            .getJWTClaimsSet()
                            .getExpirationTime()
                            .toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime())
                    .build();
            userSessionRepository.save(refreshSession);
        } catch (ParseException e) {
            log.error("Failed to parse generated token", e);
        }

        return AuthenticationResponse.builder()
                .token(token)
                .refreshToken(newRefreshToken)
                .authenticated(true)
                .build();
    }

    private String generateToken(User user, long durationInSeconds, boolean isRefresh) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .claim("userId", user.getUserId().toString())
                .subject(user.getEmail())
                .issuer("ueims.com")
                .claim("authorities", buildScope(user))
                .claim("token_type", isRefresh ? "REFRESH" : "ACCESS")
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now()
                        .plus(durationInSeconds, ChronoUnit.SECONDS)
                        .toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("must_change_password", user.getMustChangePassword())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(signerKey.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        String tokenType = signedJWT.getJWTClaimsSet().getStringClaim("token_type");
        if (isRefresh && !"REFRESH".equals(tokenType)) throw new AppException(ErrorCode.UNAUTHENTICATED);
        if (!isRefresh && !"ACCESS".equals(tokenType)) throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(userRole -> {
                stringJoiner.add("ROLE_" + userRole.getRole().getRoleName());
                if (!CollectionUtils.isEmpty(userRole.getRole().getRolePermissions())) {
                    userRole.getRole()
                            .getRolePermissions()
                            .forEach(rolePermission -> stringJoiner.add(
                                    rolePermission.getPermission().getPermissionName()));
                }
            });

        return stringJoiner.toString();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();

        var user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.WRONG_OLD_PASSWORD);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORDS_NOT_MATCH);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        java.time.format.DateTimeFormatter formatter =
                java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        String changedAt = java.time.LocalDateTime.now().format(formatter);
        mailService.sendPasswordChangedMail(user.getEmail(), user.getFullName(), changedAt);
    }

    @Transactional
    public void forgotPassword(com.ueims.dto.request.ForgotPasswordRequest request) {
        var user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String tokenRaw = UUID.randomUUID().toString();

        com.ueims.model.entity.PasswordResetToken resetToken = com.ueims.model.entity.PasswordResetToken.builder()
                .user(user)
                .tokenHash(tokenRaw)
                .expiresAt(java.time.LocalDateTime.now().plusMinutes(15))
                .isUsed(false)
                .build();

        passwordResetTokenRepository.save(resetToken);

        mailService.sendPasswordResetMail(user.getEmail(), user.getFullName(), tokenRaw);
    }

    @Transactional
    public void resetPassword(com.ueims.dto.request.ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORDS_NOT_MATCH);
        }

        var resetToken = passwordResetTokenRepository
                .findByTokenHash(request.getToken())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY)); // Reusing INVALID_KEY for invalid token

        if (resetToken.getIsUsed()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        if (resetToken.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        var user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        resetToken.setIsUsed(true);
        passwordResetTokenRepository.save(resetToken);

        java.time.format.DateTimeFormatter formatter =
                java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        String changedAt = java.time.LocalDateTime.now().format(formatter);
        mailService.sendPasswordChangedMail(user.getEmail(), user.getFullName(), changedAt);

        // Invalidate all old sessions so they have to login again
        userSessionManagementService.invalidateOldSessions(user.getEmail());
    }
}
