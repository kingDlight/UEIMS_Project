package com.ueims.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.ueims.dto.request.AuthenticationRequest;
import com.ueims.dto.request.ChangePasswordRequest;
import com.ueims.dto.request.ForgotPasswordRequest;
import com.ueims.dto.request.IntrospectRequest;
import com.ueims.dto.request.LogoutRequest;
import com.ueims.dto.request.RefreshRequest;
import com.ueims.dto.request.ResetPasswordRequest;
import com.ueims.dto.response.AuthenticationResponse;
import com.ueims.dto.response.IntrospectResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.PasswordResetToken;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserSession;
import com.ueims.repository.AuditLogRepository;
import com.ueims.repository.InvalidatedTokenRepository;
import com.ueims.repository.PasswordResetTokenRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.UserSessionRepository;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private InvalidatedTokenRepository invalidatedTokenRepository;

    @Mock
    private UserSessionRepository userSessionRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserSessionManagementService userSessionManagementService;
    private boolean sessionInvalidated;

    private MailService mailService;

    private AuthenticationService service;

    private final String SIGNER_KEY = "1234567890123456789012345678901234567890123456789012345678901234";
    private User user;
    private String validToken;

    @BeforeEach
    void setUp() throws Exception {
        mailService = new MailService(null, null) {
            @Override
            public void sendPasswordChangedMail(String to, String fullName, String time) {}

            @Override
            public void sendPasswordResetMail(String to, String fullName, String resetLink) {}
        };

        sessionInvalidated = false;
        userSessionManagementService = new UserSessionManagementService(null, null) {
            @Override
            public void invalidateOldSessions(String email) {
                sessionInvalidated = true;
            }
        };

        service = new AuthenticationService(
                userRepository,
                invalidatedTokenRepository,
                userSessionRepository,
                auditLogRepository,
                passwordResetTokenRepository,
                mailService,
                passwordEncoder,
                userSessionManagementService);

        ReflectionTestUtils.setField(service, "signerKey", SIGNER_KEY);
        ReflectionTestUtils.setField(service, "validDuration", 3600L);
        ReflectionTestUtils.setField(service, "refreshableDuration", 7200L);
        ReflectionTestUtils.setField(service, "googleClientId", "google-client-id");

        user = User.builder()
                .userId(UUID.randomUUID())
                .email("test@test.com")
                .password("hashedPassword")
                .fullName("Test User")
                .status("ACTIVE")
                .failedLoginAttempts(0)
                .mustChangePassword(false)
                .build();

        validToken = generateTestToken(user, "ACCESS", 3600L);

        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    private String generateTestToken(User user, String tokenType, long duration) throws Exception {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .claim("token_type", tokenType)
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(duration, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);
        jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
        return jwsObject.serialize();
    }

    @Test
    void authenticate_success() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("test@test.com")
                .password("pass")
                .deviceId("dev1")
                .build();
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass", "hashedPassword")).thenReturn(true);

        AuthenticationResponse response = service.authenticate(request);

        assertTrue(response.isAuthenticated());
        assertNotNull(response.getToken());
        assertNotNull(response.getRefreshToken());
        assertTrue(sessionInvalidated);
        verify(userSessionRepository, times(2)).save(any(UserSession.class));
    }

    @Test
    void authenticate_whenWrongPassword_throwsException() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("test@test.com")
                .password("wrong")
                .build();
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashedPassword")).thenReturn(false);

        AppException e = assertThrows(AppException.class, () -> service.authenticate(request));
        assertEquals(ErrorCode.UNAUTHENTICATED, e.getErrorCode());
        verify(userRepository).updateLoginAttemptsAndStatus(eq(user.getUserId()), eq(1), eq("ACTIVE"), isNull());
    }

    @Test
    void authenticate_whenLocked_throwsException() {
        user.setStatus("LOCKED");
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("test@test.com")
                .password("pass")
                .build();
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));

        AppException e = assertThrows(AppException.class, () -> service.authenticate(request));
        assertEquals(ErrorCode.USER_BANNED, e.getErrorCode());
    }

    @Test
    void introspect_whenValidToken_returnsTrue() {
        IntrospectRequest request =
                IntrospectRequest.builder().token(validToken).build();
        when(invalidatedTokenRepository.existsById(anyString())).thenReturn(false);

        IntrospectResponse response = service.introspect(request);

        assertTrue(response.isValid());
    }

    @Test
    void introspect_whenInvalidToken_returnsFalse() {
        IntrospectRequest request = IntrospectRequest.builder().token("invalid").build();

        IntrospectResponse response = service.introspect(request);

        assertFalse(response.isValid());
    }

    @Test
    void logout_success() throws Exception {
        LogoutRequest request = LogoutRequest.builder().token(validToken).build();
        when(invalidatedTokenRepository.existsById(anyString())).thenReturn(false);

        service.logout(request);

        assertTrue(sessionInvalidated);
    }

    @Test
    void changePassword_success() {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("test@test.com", null));
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .oldPassword("old")
                .newPassword("new")
                .confirmPassword("new")
                .build();

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old", "hashedPassword")).thenReturn(true);
        when(passwordEncoder.encode("new")).thenReturn("newHashed");

        service.changePassword(request);

        assertEquals("newHashed", user.getPassword());
        verify(userRepository).save(user);
    }

    @Test
    void changePassword_whenPasswordsNotMatch_throwsException() {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("test@test.com", null));
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .oldPassword("old")
                .newPassword("new")
                .confirmPassword("diff")
                .build();

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old", "hashedPassword")).thenReturn(true);

        AppException e = assertThrows(AppException.class, () -> service.changePassword(request));
        assertEquals(ErrorCode.PASSWORDS_NOT_MATCH, e.getErrorCode());
    }

    @Test
    void forgotPassword_success() {
        ForgotPasswordRequest request =
                ForgotPasswordRequest.builder().email("test@test.com").build();
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        service.forgotPassword(request);

        verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
    }

    @Test
    void resetPassword_success() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .token("validHash")
                .newPassword("new")
                .confirmPassword("new")
                .build();
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .tokenHash("validHash")
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .isUsed(false)
                .build();

        when(passwordResetTokenRepository.findByTokenHash("validHash")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("new")).thenReturn("newHashed");

        service.resetPassword(request);

        assertTrue(token.getIsUsed());
        assertEquals("newHashed", user.getPassword());
        verify(userRepository).save(user);
        assertTrue(sessionInvalidated);
    }

    @Test
    void refreshToken_success() throws Exception {
        String refreshTok = generateTestToken(user, "REFRESH", 7200L);
        RefreshRequest request =
                RefreshRequest.builder().token(refreshTok).deviceId("dev1").build();

        UserSession session =
                UserSession.builder().deviceId("dev1").email("test@test.com").build();
        when(invalidatedTokenRepository.existsById(anyString())).thenReturn(false);
        when(userSessionRepository.findById(anyString())).thenReturn(Optional.of(session));
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        AuthenticationResponse response = service.refreshToken(request);

        assertTrue(response.isAuthenticated());
        assertNotNull(response.getToken());
    }
}
