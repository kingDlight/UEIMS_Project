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
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
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
import com.ueims.dto.request.GoogleAuthenticationRequest;
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

    @Mock
    private JwtDecoder googleJwtDecoder;

    private UserSessionManagementService userSessionManagementService;
    private boolean sessionInvalidated;

    private MailService mailService;

    private AuthenticationService service;

    private final String signerKey = "1234567890123456789012345678901234567890123456789012345678901234";
    private User user;
    private String validToken;

    private static final String TEST_EMAIL = "test@test.com";
    private static final String HASHED_PASSWORD = "hashedPassword";
    private static final String GOOGLE_CLIENT_ID_STR = "google-client-id";
    private static final String GOOGLE_CLIENT_ID_FIELD = "googleClientId";
    private static final String GOOGLE_JWT_DECODER_FIELD = "googleJwtDecoder";
    private static final String DUMMY_ID_TOKEN = "dummyIdToken";
    private static final String DUMMY = "dummy";
    private static final String DEV_ID = "dev1";
    private static final String GOOGLE_ISSUER = "https://accounts.google.com";
    private static final String GOOGLE_EMAIL = "google@test.com";
    private static final String NEW_GOOGLE_EMAIL = "newgoogle@test.com";
    private static final String CLAIM_EMAIL_VERIFIED = "email_verified";
    private static final String VALID_HASH = "validHash";
    private static final String NEW_HASHED = "newHashed";

    @BeforeEach
    void setUp() throws Exception {
        mailService = new MailService(null, null) {
            @Override
            public void sendPasswordChangedMail(String to, String fullName, String time) {
                // Empty mock method
            }

            @Override
            public void sendPasswordResetMail(String to, String fullName, String resetLink) {
                // Empty mock method
            }
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

        ReflectionTestUtils.setField(service, "signerKey", signerKey);
        ReflectionTestUtils.setField(service, "validDuration", 3600L);
        ReflectionTestUtils.setField(service, "refreshableDuration", 7200L);
        ReflectionTestUtils.setField(service, GOOGLE_CLIENT_ID_FIELD, GOOGLE_CLIENT_ID_STR);

        user = User.builder()
                .userId(UUID.randomUUID())
                .email(TEST_EMAIL)
                .password(HASHED_PASSWORD)
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
        jwsObject.sign(new MACSigner(signerKey.getBytes()));
        return jwsObject.serialize();
    }

    @Test
    void authenticate_success() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email(TEST_EMAIL)
                .password("pass")
                .deviceId(DEV_ID)
                .build();
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass", HASHED_PASSWORD)).thenReturn(true);

        AuthenticationResponse response = service.authenticate(request);

        assertTrue(response.isAuthenticated());
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertTrue(sessionInvalidated);
        verify(userSessionRepository, times(2)).save(any(UserSession.class));
    }

    @Test
    void authenticate_whenWrongPassword_throwsException() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email(TEST_EMAIL)
                .password("wrong")
                .build();
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", HASHED_PASSWORD)).thenReturn(false);

        AppException e = assertThrows(AppException.class, () -> service.authenticate(request));
        assertEquals(ErrorCode.UNAUTHENTICATED, e.getErrorCode());
        verify(userRepository).updateLoginAttemptsAndStatus(eq(user.getUserId()), eq(1), eq("ACTIVE"), isNull());
    }

    @Test
    void authenticate_whenLocked_throwsException() {
        user.setStatus("LOCKED");
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email(TEST_EMAIL)
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
    void logout_success() {
        LogoutRequest request = LogoutRequest.builder().token(validToken).build();
        when(invalidatedTokenRepository.existsById(anyString())).thenReturn(false);

        service.logout(request);

        assertTrue(sessionInvalidated);
    }

    @Test
    void changePassword_success() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(TEST_EMAIL, null));
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .oldPassword("old")
                .newPassword("new")
                .confirmPassword("new")
                .build();

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old", HASHED_PASSWORD)).thenReturn(true);
        when(passwordEncoder.encode("new")).thenReturn(NEW_HASHED);

        service.changePassword(request);

        assertEquals(NEW_HASHED, user.getPassword());
        verify(userRepository).save(user);
    }

    @Test
    void changePassword_whenPasswordsNotMatch_throwsException() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(TEST_EMAIL, null));
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .oldPassword("old")
                .newPassword("new")
                .confirmPassword("diff")
                .build();

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old", HASHED_PASSWORD)).thenReturn(true);

        AppException e = assertThrows(AppException.class, () -> service.changePassword(request));
        assertEquals(ErrorCode.PASSWORDS_NOT_MATCH, e.getErrorCode());
    }

    @Test
    void forgotPassword_success() {
        ForgotPasswordRequest request =
                ForgotPasswordRequest.builder().email(TEST_EMAIL).build();
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));

        service.forgotPassword(request);

        verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
    }

    @Test
    void resetPassword_success() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .token(VALID_HASH)
                .newPassword("new")
                .confirmPassword("new")
                .build();
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .tokenHash(VALID_HASH)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .isUsed(false)
                .build();

        when(passwordResetTokenRepository.findByTokenHash(VALID_HASH)).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("new")).thenReturn(NEW_HASHED);

        service.resetPassword(request);

        assertTrue(token.getIsUsed());
        assertEquals(NEW_HASHED, user.getPassword());
        verify(userRepository).save(user);
        assertTrue(sessionInvalidated);
    }

    @Test
    void refreshToken_success() throws Exception {
        String refreshTok = generateTestToken(user, "REFRESH", 7200L);
        RefreshRequest request =
                RefreshRequest.builder().token(refreshTok).deviceId(DEV_ID).build();

        UserSession session =
                UserSession.builder().deviceId(DEV_ID).email(TEST_EMAIL).build();
        when(invalidatedTokenRepository.existsById(anyString())).thenReturn(false);
        when(userSessionRepository.findById(anyString())).thenReturn(Optional.of(session));
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));

        AuthenticationResponse response = service.refreshToken(request);

        assertTrue(response.isAuthenticated());
        assertNotNull(response.getAccessToken());
    }

    @Test
    void authenticateWithGoogleSuccess() throws Exception {
        GoogleAuthenticationRequest request = GoogleAuthenticationRequest.builder()
                .idToken(DUMMY_ID_TOKEN)
                .deviceId(DEV_ID)
                .build();

        ReflectionTestUtils.setField(service, GOOGLE_JWT_DECODER_FIELD, googleJwtDecoder);
        ReflectionTestUtils.setField(service, GOOGLE_CLIENT_ID_FIELD, GOOGLE_CLIENT_ID_STR);

        Jwt jwt = Jwt.withTokenValue(DUMMY_ID_TOKEN)
                .header("alg", "none")
                .issuer(GOOGLE_ISSUER)
                .audience(java.util.List.of(GOOGLE_CLIENT_ID_STR))
                .claim(CLAIM_EMAIL_VERIFIED, true)
                .claim("email", GOOGLE_EMAIL)
                .claim("name", "Google User")
                .claim("picture", "http://picture.url")
                .build();
        when(googleJwtDecoder.decode(DUMMY_ID_TOKEN)).thenReturn(jwt);

        when(userRepository.findByEmail(GOOGLE_EMAIL)).thenReturn(Optional.of(user));

        AuthenticationResponse response = service.authenticateWithGoogle(request);

        assertTrue(response.isAuthenticated());
        assertNotNull(response.getAccessToken());
        verify(userRepository).findByEmail(GOOGLE_EMAIL);
    }

    @Test
    void authenticateWithGoogleNewUserSuccess() throws Exception {
        GoogleAuthenticationRequest request = GoogleAuthenticationRequest.builder()
                .idToken(DUMMY_ID_TOKEN)
                .deviceId(DEV_ID)
                .build();

        ReflectionTestUtils.setField(service, GOOGLE_JWT_DECODER_FIELD, googleJwtDecoder);
        ReflectionTestUtils.setField(service, GOOGLE_CLIENT_ID_FIELD, GOOGLE_CLIENT_ID_STR);

        Jwt jwt = Jwt.withTokenValue(DUMMY_ID_TOKEN)
                .header("alg", "none")
                .issuer(GOOGLE_ISSUER)
                .audience(java.util.List.of(GOOGLE_CLIENT_ID_STR))
                .claim(CLAIM_EMAIL_VERIFIED, true)
                .claim("email", NEW_GOOGLE_EMAIL)
                .claim("name", "New Google User")
                .claim("picture", "http://picture.url")
                .build();
        when(googleJwtDecoder.decode(DUMMY_ID_TOKEN)).thenReturn(jwt);

        when(userRepository.findByEmail(NEW_GOOGLE_EMAIL)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        User newUser = User.builder()
                .email(NEW_GOOGLE_EMAIL)
                .userId(UUID.randomUUID())
                .status("ACTIVE")
                .failedLoginAttempts(0)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(newUser);

        AuthenticationResponse response = service.authenticateWithGoogle(request);

        assertTrue(response.isAuthenticated());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void authenticateWithGoogleUpdateUserSuccess() throws Exception {
        GoogleAuthenticationRequest request = GoogleAuthenticationRequest.builder()
                .idToken(DUMMY_ID_TOKEN)
                .deviceId(DEV_ID)
                .build();

        ReflectionTestUtils.setField(service, GOOGLE_JWT_DECODER_FIELD, googleJwtDecoder);
        ReflectionTestUtils.setField(service, GOOGLE_CLIENT_ID_FIELD, GOOGLE_CLIENT_ID_STR);

        Jwt jwt = Jwt.withTokenValue(DUMMY_ID_TOKEN)
                .header("alg", "none")
                .issuer(GOOGLE_ISSUER)
                .audience(java.util.List.of(GOOGLE_CLIENT_ID_STR))
                .claim(CLAIM_EMAIL_VERIFIED, true)
                .claim("email", TEST_EMAIL)
                .claim("name", "Updated Google User")
                .claim("picture", "http://new-picture.url")
                .build();
        when(googleJwtDecoder.decode(DUMMY_ID_TOKEN)).thenReturn(jwt);

        user.setAuthProvider("GOOGLE");
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));

        AuthenticationResponse response = service.authenticateWithGoogle(request);

        assertTrue(response.isAuthenticated());
        verify(userRepository).save(user);
        assertEquals("Updated Google User", user.getFullName());
    }

    @Test
    void authenticateWithGoogleNoClientIdThrowsException() {
        GoogleAuthenticationRequest request =
                GoogleAuthenticationRequest.builder().idToken(DUMMY).build();
        ReflectionTestUtils.setField(service, GOOGLE_CLIENT_ID_FIELD, null);

        AppException e = assertThrows(AppException.class, () -> service.authenticateWithGoogle(request));
        assertEquals(ErrorCode.GOOGLE_CLIENT_ID_NOT_CONFIGURED, e.getErrorCode());
    }

    @Test
    void authenticateWithGoogleInvalidIssuerThrowsException() throws Exception {
        GoogleAuthenticationRequest request =
                GoogleAuthenticationRequest.builder().idToken(DUMMY).build();
        ReflectionTestUtils.setField(service, GOOGLE_JWT_DECODER_FIELD, googleJwtDecoder);
        ReflectionTestUtils.setField(service, GOOGLE_CLIENT_ID_FIELD, GOOGLE_CLIENT_ID_STR);

        Jwt jwt = Jwt.withTokenValue(DUMMY)
                .header("alg", "none")
                .issuer("https://invalid.issuer.com")
                .claim(DUMMY, DUMMY)
                .build();
        when(googleJwtDecoder.decode(DUMMY)).thenReturn(jwt);

        AppException e = assertThrows(AppException.class, () -> service.authenticateWithGoogle(request));
        assertEquals(ErrorCode.UNAUTHENTICATED, e.getErrorCode());
    }

    @Test
    void authenticateWithGoogleInvalidAudienceThrowsException() throws Exception {
        GoogleAuthenticationRequest request =
                GoogleAuthenticationRequest.builder().idToken(DUMMY).build();
        ReflectionTestUtils.setField(service, GOOGLE_JWT_DECODER_FIELD, googleJwtDecoder);
        ReflectionTestUtils.setField(service, GOOGLE_CLIENT_ID_FIELD, GOOGLE_CLIENT_ID_STR);

        Jwt jwt = Jwt.withTokenValue(DUMMY)
                .header("alg", "none")
                .issuer(GOOGLE_ISSUER)
                .audience(java.util.List.of("wrong-audience"))
                .claim(DUMMY, DUMMY)
                .build();
        when(googleJwtDecoder.decode(DUMMY)).thenReturn(jwt);

        AppException e = assertThrows(AppException.class, () -> service.authenticateWithGoogle(request));
        assertEquals(ErrorCode.UNAUTHENTICATED, e.getErrorCode());
    }
}
