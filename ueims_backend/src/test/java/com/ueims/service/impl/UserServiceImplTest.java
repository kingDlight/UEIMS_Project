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

    private UserServiceImpl userService;

    private User user;
    private UUID userId;
    private boolean mailSent;

    @BeforeEach
    void setUp() {
        userSessionRepository = org.mockito.Mockito.mock(com.ueims.repository.UserSessionRepository.class);
        mailSent = false;
        MailService mailService = new MailService(null, null) {
            @Override
            public void sendWelcomeMail(String to, String name, String randomPassword) {
                mailSent = true;
            }
        };
        userService = new UserServiceImpl(
                repository, mailService, passwordEncoder, userSessionRepository, invalidatedTokenRepository);

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
        org.junit.jupiter.api.Assertions.assertTrue(mailSent);
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

    @Test
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
}
