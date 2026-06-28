package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ueims.dto.request.UserCreationRequest;
import com.ueims.dto.response.UserResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.User;
import com.ueims.repository.InvalidatedTokenRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.MailService;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    private static final String TEST_EMAIL = "test@test.com";
    private static final String LOCKED_STATUS = "LOCKED";

    @Mock
    private UserRepository repository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private com.ueims.repository.UserSessionRepository userSessionRepository;

    @Mock
    private InvalidatedTokenRepository invalidatedTokenRepository;

    @Mock
    private com.ueims.repository.EligibleStudentRepository eligibleStudentRepository;

    private UserServiceImpl userService;

    private User user;
    private UUID userId;
    private MailService mailService;

    @BeforeEach
    void setUp() {
        userSessionRepository = org.mockito.Mockito.mock(com.ueims.repository.UserSessionRepository.class);
        mailService = org.mockito.Mockito.mock(MailService.class);
        userService = new UserServiceImpl(
                repository,
                mailService,
                passwordEncoder,
                userSessionRepository,
                invalidatedTokenRepository,
                eligibleStudentRepository);

        userId = UUID.randomUUID();
        user = User.builder()
                .userId(userId)
                .email(TEST_EMAIL)
                .fullName("Test User")
                .phone("0123456789")
                .status("ACTIVE")
                .build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(user));

        List<com.ueims.dto.response.UserDetailResponse> result = userService.findAll();

        assertEquals(1, result.size());
        assertEquals(TEST_EMAIL, result.get(0).getEmail());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(userId)).thenReturn(Optional.of(user));

        com.ueims.dto.response.UserDetailResponse result = userService.findById(userId);

        assertNotNull(result);
        assertEquals(TEST_EMAIL, result.getEmail());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(userId)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> userService.findById(userId));

        assertEquals(ErrorCode.USER_NOT_EXISTED, exception.getErrorCode());
    }

    @Test
    void saveSuccess() {
        when(repository.save(user)).thenReturn(user);

        User result = userService.save(user);

        assertNotNull(result);
        assertEquals(TEST_EMAIL, result.getEmail());
    }

    @Test
    void createUserSuccess() {
        UserCreationRequest request = UserCreationRequest.builder()
                .email(TEST_EMAIL)
                .fullName("New User")
                .phone("0987654321")
                .build();

        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(repository.save(any(User.class))).thenAnswer(i -> {
            User savedUser = i.getArgument(0);
            savedUser.setUserId(UUID.randomUUID());
            return savedUser;
        });

        User result = userService.createUser(request);

        assertNotNull(result);
        assertEquals(TEST_EMAIL, result.getEmail());
        assertEquals("ACTIVE", result.getStatus());
        org.mockito.Mockito.verify(mailService, org.mockito.Mockito.times(1))
                .sendWelcomeMail(
                        org.mockito.ArgumentMatchers.anyString(),
                        org.mockito.ArgumentMatchers.anyString(),
                        org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void deleteByIdSuccess() {
        userService.deleteById(userId);

        verify(repository).deleteById(userId);
    }

    @Test
    void updateUserStatusSuccess() {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("admin@test.com", null));
        User adminUser =
                User.builder().userId(UUID.randomUUID()).email("admin@test.com").build();
        when(repository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));

        when(repository.findById(userId)).thenReturn(Optional.of(user));
        userService.updateUserStatus(userId, LOCKED_STATUS);

        assertEquals(LOCKED_STATUS, user.getStatus());
        verify(repository).save(user);
    }

    @Test
    void updateUserStatusNotFoundThrowsException() {
        when(repository.findById(userId)).thenReturn(Optional.empty());

        AppException exception =
                assertThrows(AppException.class, () -> userService.updateUserStatus(userId, LOCKED_STATUS));

        assertEquals(ErrorCode.USER_NOT_EXISTED, exception.getErrorCode());
    }

    void getMyInfoSuccess() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(TEST_EMAIL, null));
        when(repository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));

        UserResponse result = userService.getMyInfo();

        assertNotNull(result);
        assertEquals(TEST_EMAIL, result.getEmail());
    }

    @Test
    void getMyInfoNotFoundThrowsException() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(TEST_EMAIL, null));
        when(repository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> userService.getMyInfo());

        assertEquals(ErrorCode.USER_NOT_EXISTED, exception.getErrorCode());
    }

    @Test
    void uploadAvatarFileNullThrowsException() {
        AppException exception = assertThrows(AppException.class, () -> userService.uploadAvatar(null));
        assertEquals(ErrorCode.FIELD_REQUIRED, exception.getErrorCode());
    }

    @Test
    void uploadAvatarFileEmptyThrowsException() {
        org.springframework.web.multipart.MultipartFile file =
                org.mockito.Mockito.mock(org.springframework.web.multipart.MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);
        AppException exception = assertThrows(AppException.class, () -> userService.uploadAvatar(file));
        assertEquals(ErrorCode.FIELD_REQUIRED, exception.getErrorCode());
    }

    @Test
    void uploadAvatarFileTooLargeThrowsException() {
        org.springframework.web.multipart.MultipartFile file =
                org.mockito.Mockito.mock(org.springframework.web.multipart.MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(3L * 1024 * 1024); // 3MB
        AppException exception = assertThrows(AppException.class, () -> userService.uploadAvatar(file));
        assertEquals(ErrorCode.INVALID_KEY, exception.getErrorCode());
    }

    @Test
    void uploadAvatarInvalidContentTypeThrowsException() {
        org.springframework.web.multipart.MultipartFile file =
                org.mockito.Mockito.mock(org.springframework.web.multipart.MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(1L * 1024 * 1024); // 1MB
        when(file.getContentType()).thenReturn("application/pdf");
        AppException exception = assertThrows(AppException.class, () -> userService.uploadAvatar(file));
        assertEquals(ErrorCode.INVALID_KEY, exception.getErrorCode());
    }

    @Test
    void getCurrentUserIdSuccess() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(TEST_EMAIL, null));
        when(repository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));

        UUID result = userService.getCurrentUserId();

        assertEquals(userId, result);
    }

    @Test
    void updateUserStatusSelfLockThrowsException() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(TEST_EMAIL, null));
        when(repository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));
        when(repository.findById(userId)).thenReturn(Optional.of(user));

        AppException exception = assertThrows(AppException.class, () -> userService.updateUserStatus(userId, "LOCKED"));

        assertEquals(ErrorCode.ADMIN_INTERVENTION_REQUIRED, exception.getErrorCode());
    }

    @Test
    void updateUserStatusUnlocking() {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("admin@test.com", null));
        User adminUser =
                User.builder().userId(UUID.randomUUID()).email("admin@test.com").build();
        when(repository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));

        user.setFailedLoginAttempts(3);
        user.setLockedUntil(java.time.LocalDateTime.now().plusDays(1));
        when(repository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateUserStatus(userId, "ACTIVE");

        assertEquals("ACTIVE", user.getStatus());
        assertEquals(0, user.getFailedLoginAttempts());
        org.junit.jupiter.api.Assertions.assertNull(user.getLockedUntil());
        verify(repository).save(user);
    }

    @Test
    void updateUserStatusLockedWithDuration() {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("admin@test.com", null));
        User adminUser =
                User.builder().userId(UUID.randomUUID()).email("admin@test.com").build();
        when(repository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));

        when(repository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateUserStatus(userId, "LOCKED", 30);

        assertEquals("LOCKED", user.getStatus());
        assertNotNull(user.getLockedUntil());
        verify(repository).save(user);
        // also verify forceLogoutUser
        verify(userSessionRepository).findByEmail(user.getEmail());
    }

    @Test
    void updateMyInfoSuccess() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(TEST_EMAIL, null));
        when(repository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));

        com.ueims.dto.request.UserUpdateRequest request = com.ueims.dto.request.UserUpdateRequest.builder()
                .fullName("Updated Name")
                .phone("0111222333")
                .build();

        UserResponse result = userService.updateMyInfo(request);

        assertEquals("Updated Name", user.getFullName());
        assertEquals("0111222333", user.getPhone());
        verify(repository).save(user);
        assertNotNull(result);
    }

    @Test
    void updateUserSuccess() {
        when(repository.findById(userId)).thenReturn(Optional.of(user));

        com.ueims.dto.request.UserUpdateRequest request = com.ueims.dto.request.UserUpdateRequest.builder()
                .fullName("New Name")
                .password("newPass")
                .build();
        when(passwordEncoder.encode("newPass")).thenReturn("hashedNewPass");

        com.ueims.dto.response.UserDetailResponse result = userService.updateUser(userId, request);

        assertEquals("New Name", user.getFullName());
        assertEquals("hashedNewPass", user.getPassword());
        verify(repository).save(user);
        assertNotNull(result);
    }

    @Test
    void updateUserEmailSuccess() {
        when(repository.findById(userId)).thenReturn(Optional.of(user));
        when(repository.existsByEmail("new@test.com")).thenReturn(false);
        when(eligibleStudentRepository.findAllByUser_UserId(userId)).thenReturn(List.of());

        com.ueims.dto.request.UpdateEmailRequest request = new com.ueims.dto.request.UpdateEmailRequest();
        request.setNewEmail("new@test.com");

        com.ueims.dto.response.UserDetailResponse result = userService.updateUserEmail(userId, request);

        assertEquals("new@test.com", user.getEmail());
        verify(repository).save(user);
        verify(userSessionRepository).findByEmail(TEST_EMAIL); // forced logout
        assertNotNull(result);
    }

    @Test
    void updateUserEmailEmptyThrowsException() {
        when(repository.findById(userId)).thenReturn(Optional.of(user));

        com.ueims.dto.request.UpdateEmailRequest request = new com.ueims.dto.request.UpdateEmailRequest();
        request.setNewEmail("");

        AppException exception = assertThrows(AppException.class, () -> userService.updateUserEmail(userId, request));
        assertEquals(ErrorCode.INVALID_REQUEST, exception.getErrorCode());
    }

    @Test
    void updateUserEmailExistsThrowsException() {
        when(repository.findById(userId)).thenReturn(Optional.of(user));
        when(repository.existsByEmail("exist@test.com")).thenReturn(true);

        com.ueims.dto.request.UpdateEmailRequest request = new com.ueims.dto.request.UpdateEmailRequest();
        request.setNewEmail("exist@test.com");

        AppException exception = assertThrows(AppException.class, () -> userService.updateUserEmail(userId, request));
        assertEquals(ErrorCode.EMAIL_ALREADY_EXISTS, exception.getErrorCode());
    }
}
