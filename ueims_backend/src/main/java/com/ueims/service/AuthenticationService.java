package com.ueims.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.ueims.dto.request.AuthenticationRequest;
import com.ueims.dto.request.ChangePasswordRequest;
import com.ueims.dto.request.ForgotPasswordRequest;
import com.ueims.dto.request.GoogleAuthenticationRequest;
import com.ueims.dto.request.IntrospectRequest;
import com.ueims.dto.request.LogoutRequest;
import com.ueims.dto.request.RefreshRequest;
import com.ueims.dto.request.ResetPasswordRequest;
import com.ueims.dto.response.AuthenticationResponse;
import com.ueims.dto.response.IntrospectResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.AuditLog;
import com.ueims.model.entity.InvalidatedToken;
import com.ueims.model.entity.PasswordResetToken;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserSession;
import com.ueims.repository.AuditLogRepository;
import com.ueims.repository.InvalidatedTokenRepository;
import com.ueims.repository.PasswordResetTokenRepository;
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
    AuditLogRepository auditLogRepository;
    PasswordResetTokenRepository passwordResetTokenRepository;
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

    @NonFinal
    @Value("${google.client-id}")
    private String googleClientId;

    private static final String ACCESS_TOKEN_TYPE = "ACCESS";
    private static final String REFRESH_TOKEN_TYPE = "REFRESH";
    private static final String LOCAL_AUTH_PROVIDER = "LOCAL";
    private static final String GOOGLE_AUTH_PROVIDER = "GOOGLE";

    public IntrospectResponse introspect(IntrospectRequest request) {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token, ACCESS_TOKEN_TYPE);
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

        checkAndResetLockStatus(user);

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!authenticated) {
            handleFailedLogin(user);
        }

        // Đăng nhập thành công → Reset bộ đếm
        if (user.getFailedLoginAttempts() > 0) {
            userRepository.updateLoginAttemptsAndStatus(user.getUserId(), 0, user.getStatus(), null);
        }

        return handleAuthenticationSuccess(user, request.getDeviceId());
    }

    /**
     * Unified lock check.
     *
     * <p><b>Unified semantics:</b> an account is considered "locked" iff
     * {@code status = 'LOCKED'} (which means {@code lockedUntil} is also set
     * — admin lock OR 5-failed-attempts lock). Both lock types use the same
     * status field so the admin UI shows them identically.
     *
     * <ul>
     *   <li>If {@code status = 'INACTIVE'} → reject (account permanently
     *       disabled by admin, not auto-recoverable).</li>
     *   <li>If {@code status = 'LOCKED'} but {@code lockedUntil} has passed →
     *       auto-unlock: clear counter, clear lockedUntil, set status back
     *       to ACTIVE. This implements the 30-minute auto-recovery from
     *       failed-login lockout. Admin-set locks never have a
     *       {@code lockedUntil}, so they survive this branch.</li>
     *   <li>If {@code status = 'LOCKED'} and still within lock window →
     *       reject with USER_LOCKED.</li>
     * </ul>
     */
    private void checkAndResetLockStatus(User user) {
        if ("INACTIVE".equals(user.getStatus())) {
            throw new AppException(ErrorCode.USER_INACTIVE);
        }

        if ("LOCKED".equals(user.getStatus())) {
            if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
                // Still inside the auto-recovery window — reject.
                throw new AppException(ErrorCode.USER_LOCKED);
            }
            // Either admin-lock (no lockedUntil) — keep LOCKED until admin acts,
            // OR auto-lock whose 30-min window has expired — recover.
            if (user.getLockedUntil() != null) {
                userRepository.updateLoginAttemptsAndStatus(
                        user.getUserId(), 0, "ACTIVE", null);
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(null);
                user.setStatus("ACTIVE");
            } else {
                // Admin lock — no auto-recovery.
                throw new AppException(ErrorCode.USER_LOCKED);
            }
        }
    }

    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        LocalDateTime lockedUntil = null;
        String nextStatus = user.getStatus();

        if (attempts >= 5) {
            // Unified lock: status = LOCKED AND lockedUntil set, so:
            //  1. Admin UI sees LOCKED and can manually unlock.
            //  2. User gets the error code that points them to admin or to wait 30min.
            lockedUntil = LocalDateTime.now().plusMinutes(30);
            nextStatus = "LOCKED";
        }

        userRepository.updateLoginAttemptsAndStatus(
                user.getUserId(), attempts, nextStatus, lockedUntil);

        user.setFailedLoginAttempts(attempts);
        user.setLockedUntil(lockedUntil);
        user.setStatus(nextStatus);

        if (attempts >= 5) {
            throw new AppException(ErrorCode.USER_LOCKED);
        }
        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    private AuthenticationResponse handleAuthenticationSuccess(User user, String deviceId) {
        userSessionManagementService.invalidateOldSessions(user.getEmail());

        String token = generateAccessToken(user, validDuration);
        String refreshToken = generateRefreshToken(user, refreshableDuration);

        saveAuthSessions(user, token, refreshToken, deviceId);
        auditLoginSuccess(user);

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return AuthenticationResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .authenticated(true)
                .mustChangePassword(Boolean.TRUE.equals(user.getMustChangePassword()))
                .build();
    }

    @NonFinal
    private JwtDecoder googleJwtDecoder;

    public AuthenticationResponse authenticateWithGoogle(GoogleAuthenticationRequest request) {
        validateGoogleConfig();

        Jwt googleJwt = decodeGoogleToken(request.getIdToken());
        validateGoogleTokenClaims(googleJwt);

        String email = googleJwt.getClaimAsString("email");
        String fullName = googleJwt.getClaimAsString("name");
        String pictureUrl = googleJwt.getClaimAsString("picture");
        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> createGoogleUser(email, fullName, pictureUrl));

        updateGoogleUserIfNeeded(user, fullName, pictureUrl);

        checkAndResetLockStatus(user);

        return handleAuthenticationSuccess(user, request.getDeviceId());
    }

    private void validateGoogleConfig() {
        if (googleClientId == null || googleClientId.isBlank()) {
            log.error("GOOGLE_CLIENT_ID is not configured. Set the environment variable or application property.");
            throw new AppException(ErrorCode.GOOGLE_CLIENT_ID_NOT_CONFIGURED);
        }

        if (googleJwtDecoder == null) {
            googleJwtDecoder = NimbusJwtDecoder.withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
                    .build();
        }
    }

    private Jwt decodeGoogleToken(String idToken) {
        try {
            return googleJwtDecoder.decode(idToken);
        } catch (Exception exception) {
            log.error("Invalid Google ID token", exception);
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    private void validateGoogleTokenClaims(Jwt googleJwt) {
        String issuer = googleJwt.getIssuer().toString();
        if (!"https://accounts.google.com".equals(issuer) && !"accounts.google.com".equals(issuer)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (googleJwt.getAudience() == null || !googleJwt.getAudience().contains(googleClientId)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Boolean emailVerified = googleJwt.getClaimAsBoolean("email_verified");
        if (emailVerified == null || !emailVerified) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    private void updateGoogleUserIfNeeded(User user, String fullName, String pictureUrl) {
        if (GOOGLE_AUTH_PROVIDER.equals(user.getAuthProvider())) {
            boolean updated = false;
            if (fullName != null && !fullName.isBlank() && !fullName.equals(user.getFullName())) {
                user.setFullName(fullName);
                updated = true;
            }
            if (pictureUrl != null && !pictureUrl.isBlank() && !pictureUrl.equals(user.getAvatarUrl())) {
                user.setAvatarUrl(pictureUrl);
                updated = true;
            }
            if (updated) {
                userRepository.save(user);
            }
        }
    }

    private User createGoogleUser(String email, String fullName, String pictureUrl) {
        String name = (fullName == null || fullName.isBlank()) ? email : fullName;

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName(name)
                .avatarUrl(pictureUrl)
                .authProvider(GOOGLE_AUTH_PROVIDER)
                .status("ACTIVE")
                .failedLoginAttempts(0)
                .mustChangePassword(false)
                .build();

        return userRepository.save(user);
    }

    private void saveAuthSessions(User user, String token, String refreshToken, String deviceId) {
        try {
            SignedJWT signedAccessJWT = SignedJWT.parse(token);
            UserSession accessSession = UserSession.builder()
                    .tokenId(signedAccessJWT.getJWTClaimsSet().getJWTID())
                    .email(user.getEmail())
                    .deviceId(deviceId)
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
                    .deviceId(deviceId)
                    .expiresAt(signedRefreshJWT
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
    }

    private void auditLoginSuccess(User user) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return;
        }
        HttpServletRequest httpRequest = attributes.getRequest();

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action("LOGIN_SUCCESS")
                .targetEntity("User")
                .targetId(user.getUserId())
                .ipAddress(httpRequest.getRemoteAddr())
                .userAgent(httpRequest.getHeader("User-Agent"))
                .build();
        auditLogRepository.save(auditLog);
    }

    public void logout(LogoutRequest request) {
        try {
            var signToken = verifyToken(request.getToken(), ACCESS_TOKEN_TYPE);

            String email = signToken.getJWTClaimsSet().getSubject();

            // Invalidate all active sessions (both access and refresh tokens)
            userSessionManagementService.invalidateOldSessions(email);
        } catch (AppException exception) {
            log.info("Token already expired");
        } catch (ParseException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    @Transactional
    public AuthenticationResponse refreshToken(RefreshRequest request) {
        try {
            var signedJWT = verifyToken(request.getToken(), REFRESH_TOKEN_TYPE);

            var jit = signedJWT.getJWTClaimsSet().getJWTID();
            var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

            var userSessionOpt = userSessionRepository.findById(jit);
            if (userSessionOpt.isEmpty()) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            var userSession = userSessionOpt.get();

            if (userSession.getDeviceId() == null || !userSession.getDeviceId().equals(request.getDeviceId())) {
                InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                        .tokenId(jit)
                        .expiresAt(expiryTime
                                .toInstant()
                                .atZone(java.time.ZoneId.systemDefault())
                                .toLocalDateTime())
                        .build();

                invalidatedTokenRepository.save(invalidatedToken);
                userSessionRepository.delete(userSession);
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            var email = signedJWT.getJWTClaimsSet().getSubject();

            var user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

            var token = generateAccessToken(user, validDuration);

            saveAccessSession(user, token, request.getDeviceId());

            return AuthenticationResponse.builder()
                    .accessToken(token)
                    .refreshToken(request.getToken())
                    .authenticated(true)
                    .build();
        } catch (ParseException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    private void saveAccessSession(User user, String token, String deviceId) {
        try {
            SignedJWT parsedToken = SignedJWT.parse(token);
            UserSession accessSession = UserSession.builder()
                    .tokenId(parsedToken.getJWTClaimsSet().getJWTID())
                    .email(user.getEmail())
                    .deviceId(deviceId)
                    .expiresAt(parsedToken
                            .getJWTClaimsSet()
                            .getExpirationTime()
                            .toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime())
                    .build();
            userSessionRepository.save(accessSession);
        } catch (ParseException e) {
            log.error("Failed to parse generated token", e);
        }
    }

    private String generateAccessToken(User user, long durationInSeconds) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .claim("userId", user.getUserId().toString())
                .subject(user.getEmail())
                .issuer("ueims.com")
                .claim("authorities", buildScope(user))
                .claim("token_type", ACCESS_TOKEN_TYPE)
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now()
                        .plus(durationInSeconds, ChronoUnit.SECONDS)
                        .toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("must_change_password", Boolean.TRUE.equals(user.getMustChangePassword()))
                .claim("full_name", user.getFullName())
                .claim("avatar_url", user.getAvatarUrl())
                .claim("phone", user.getPhone())
                .claim("status", user.getStatus())
                .claim("auth_provider", user.getAuthProvider())
                .claim(
                        "enterprise_id",
                        user.getEnterprise() != null
                                ? user.getEnterprise().getEnterpriseId().toString()
                                : null)
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

    private String generateRefreshToken(User user, long durationInSeconds) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .claim("userId", user.getUserId().toString())
                .subject(user.getEmail())
                .issuer("ueims.com")
                .claim("token_type", REFRESH_TOKEN_TYPE)
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now()
                        .plus(durationInSeconds, ChronoUnit.SECONDS)
                        .toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
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

    private SignedJWT verifyToken(String token, String expectedTokenType) {
        try {
            JWSVerifier verifier = new MACVerifier(signerKey.getBytes());

            SignedJWT signedJWT = SignedJWT.parse(token);

            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

            var verified = signedJWT.verify(verifier);

            if (!(verified && expiryTime.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);

            if (invalidatedTokenRepository.existsById(
                    signedJWT.getJWTClaimsSet().getJWTID())) throw new AppException(ErrorCode.UNAUTHENTICATED);

            String tokenType = signedJWT.getJWTClaimsSet().getStringClaim("token_type");
            if (!expectedTokenType.equals(tokenType)) throw new AppException(ErrorCode.UNAUTHENTICATED);

            return signedJWT;
        } catch (ParseException | JOSEException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
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

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        String changedAt = LocalDateTime.now().format(formatter);
        mailService.sendPasswordChangedMail(user.getEmail(), user.getFullName(), changedAt);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        var user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String tokenRaw = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(tokenRaw)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .isUsed(false)
                .build();

        passwordResetTokenRepository.save(resetToken);

        mailService.sendPasswordResetMail(user.getEmail(), user.getFullName(), tokenRaw);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORDS_NOT_MATCH);
        }

        var resetToken = passwordResetTokenRepository
                .findByTokenHash(request.getToken())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY)); // Reusing INVALID_KEY for invalid token

        if (resetToken.getIsUsed()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        var user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        resetToken.setIsUsed(true);
        passwordResetTokenRepository.save(resetToken);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        String changedAt = LocalDateTime.now().format(formatter);
        mailService.sendPasswordChangedMail(user.getEmail(), user.getFullName(), changedAt);

        // Invalidate all old sessions so they have to login again
        userSessionManagementService.invalidateOldSessions(user.getEmail());
    }
}
