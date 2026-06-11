package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ueims.dto.request.EnterpriseRegistrationRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.Role;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.RoleRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.UserRoleRepository;
import com.ueims.service.MailService;

@ExtendWith(MockitoExtension.class)
class EnterpriseRegistrationServiceImplTest {

    @Mock
    private EnterpriseRepository enterpriseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private MailService mailService;

    private boolean welcomeMailSent;

    @InjectMocks
    private EnterpriseRegistrationServiceImpl service;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        welcomeMailSent = false;
        mailService = new MailService(null, null) {
            @Override
            public void sendWelcomeMail(String to, String fullName, String tempPassword) {
                welcomeMailSent = true;
            }
        };
        // Re-inject manually to use our stub instead of mockito's failed mock
        service = new EnterpriseRegistrationServiceImpl(
                enterpriseRepository, userRepository, userRoleRepository, roleRepository, passwordEncoder, mailService);
    }

    private EnterpriseRegistrationRequest createValidRequest() {
        return EnterpriseRegistrationRequest.builder()
                .enterpriseName("Test Enterprise")
                .taxCode("123456789")
                .contactPerson("John Doe")
                .email("test@enterprise.com")
                .address("123 Test St")
                .password("Password123!")
                .confirmPassword("Password123!")
                .build();
    }

    @Test
    void register_whenValidRequest_success() {
        // Arrange
        EnterpriseRegistrationRequest request = createValidRequest();

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(enterpriseRepository.existsByTaxCode(request.getTaxCode())).thenReturn(false);

        Enterprise savedEnterprise =
                Enterprise.builder().companyName(request.getEnterpriseName()).build();
        when(enterpriseRepository.save(any(Enterprise.class))).thenReturn(savedEnterprise);

        User savedUser = User.builder()
                .email(request.getEmail())
                .fullName(request.getContactPerson())
                .build();
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        Role role = Role.builder().roleName("ENTERPRISE").build();
        when(roleRepository.findById("ENTERPRISE")).thenReturn(Optional.of(role));

        // Act
        service.register(request);

        // Assert
        verify(enterpriseRepository).save(any(Enterprise.class));
        verify(userRepository).save(any(User.class));
        verify(userRoleRepository).save(any(UserRole.class));
        assertTrue(welcomeMailSent);
    }

    @Test
    void register_whenPasswordsDoNotMatch_throwsException() {
        // Arrange
        EnterpriseRegistrationRequest request = createValidRequest();
        request.setConfirmPassword("DifferentPassword123!");

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> service.register(request));
        assertEquals(ErrorCode.PASSWORDS_NOT_MATCH, exception.getErrorCode());
        verifyNoInteractions(userRepository, enterpriseRepository);
        assertFalse(welcomeMailSent);
    }

    @Test
    void register_whenPasswordTooShort_throwsException() {
        EnterpriseRegistrationRequest request = createValidRequest();
        request.setPassword("P@1w");
        request.setConfirmPassword("P@1w");

        AppException exception = assertThrows(AppException.class, () -> service.register(request));
        assertEquals(ErrorCode.INVALID_PASSWORD, exception.getErrorCode());
    }

    @Test
    void register_whenPasswordNoUppercase_throwsException() {
        EnterpriseRegistrationRequest request = createValidRequest();
        request.setPassword("password123!");
        request.setConfirmPassword("password123!");

        AppException exception = assertThrows(AppException.class, () -> service.register(request));
        assertEquals(ErrorCode.INVALID_PASSWORD, exception.getErrorCode());
    }

    @Test
    void register_whenPasswordNoLowercase_throwsException() {
        EnterpriseRegistrationRequest request = createValidRequest();
        request.setPassword("PASSWORD123!");
        request.setConfirmPassword("PASSWORD123!");

        AppException exception = assertThrows(AppException.class, () -> service.register(request));
        assertEquals(ErrorCode.INVALID_PASSWORD, exception.getErrorCode());
    }

    @Test
    void register_whenPasswordNoDigit_throwsException() {
        EnterpriseRegistrationRequest request = createValidRequest();
        request.setPassword("Password!@#");
        request.setConfirmPassword("Password!@#");

        AppException exception = assertThrows(AppException.class, () -> service.register(request));
        assertEquals(ErrorCode.INVALID_PASSWORD, exception.getErrorCode());
    }

    @Test
    void register_whenPasswordNoSpecialChar_throwsException() {
        EnterpriseRegistrationRequest request = createValidRequest();
        request.setPassword("Password1234");
        request.setConfirmPassword("Password1234");

        AppException exception = assertThrows(AppException.class, () -> service.register(request));
        assertEquals(ErrorCode.INVALID_PASSWORD, exception.getErrorCode());
    }

    @Test
    void register_whenEmailAlreadyExists_throwsException() {
        // Arrange
        EnterpriseRegistrationRequest request = createValidRequest();
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(new User()));

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> service.register(request));
        assertEquals(ErrorCode.USER_EXISTED, exception.getErrorCode());
        verifyNoInteractions(enterpriseRepository);
        assertFalse(welcomeMailSent);
    }

    @Test
    void register_whenTaxCodeAlreadyExists_throwsException() {
        // Arrange
        EnterpriseRegistrationRequest request = createValidRequest();
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(enterpriseRepository.existsByTaxCode(request.getTaxCode())).thenReturn(true);

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> service.register(request));
        assertEquals(ErrorCode.TAX_CODE_EXISTED, exception.getErrorCode());
        verify(enterpriseRepository, never()).save(any());
        assertFalse(welcomeMailSent);
    }

    @Test
    void register_whenRoleNotFound_throwsException() {
        // Arrange
        EnterpriseRegistrationRequest request = createValidRequest();

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(enterpriseRepository.existsByTaxCode(request.getTaxCode())).thenReturn(false);

        when(enterpriseRepository.save(any(Enterprise.class))).thenReturn(new Enterprise());
        when(userRepository.save(any(User.class))).thenReturn(new User());

        when(roleRepository.findById("ENTERPRISE")).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> service.register(request));
        assertEquals(ErrorCode.INVALID_KEY, exception.getErrorCode());
    }
}
