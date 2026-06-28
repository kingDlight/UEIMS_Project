package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ueims.dto.request.EnterpriseRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.MailService;

@ExtendWith(MockitoExtension.class)
class EnterpriseServiceImplTest {

    @Mock
    private EnterpriseRepository repository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MailService mailService;

    private EnterpriseServiceImpl service;

    private Enterprise enterprise;
    private User currentUser;
    private EnterpriseRequest request;

    @BeforeEach
    void setUp() {
        service = new EnterpriseServiceImpl(repository, userRepository, mailService);

        enterprise = new Enterprise();
        enterprise.setEnterpriseId(UUID.randomUUID());
        enterprise.setCompanyName("Test Company");
        enterprise.setStatus("PENDING");
        enterprise.setContactEmail("test@company.com");
        enterprise.setContactPerson("John Doe");

        currentUser = new User();
        currentUser.setUserId(UUID.randomUUID());
        currentUser.setEmail("user@test.com");
        currentUser.setEnterprise(enterprise);

        request = new EnterpriseRequest();
        request.setCompanyName("Updated Company");
        request.setTaxCode("123456789");
        request.setWebsite("https://updated.com");
        request.setIndustry("IT");
        request.setDescription("Updated Desc");
        request.setAddress("Updated Address");
        request.setLogoUrl("logo.png");
        request.setContactPerson("Jane Doe");
        request.setContactPhone("0987654321");
        request.setContactEmail("updated@company.com");
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext(User user, String authority) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null, authority == null ? List.of() : List.of(new SimpleGrantedAuthority(authority)));
        SecurityContextHolder.getContext().setAuthentication(auth);
        lenient().when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    @Test
    void findAll_success() {
        when(repository.findAll(
                        any(org.springframework.data.jpa.domain.Specification.class),
                        any(org.springframework.data.domain.Sort.class)))
                .thenReturn(List.of(enterprise));
        List<Enterprise> list = service.findAll(null, null, null, null);
        assertEquals(1, list.size());
    }

    @Test
    void findById_success_staffAccess() {
        mockSecurityContext(currentUser, "ROLE_TRAINING_MANAGER");
        when(repository.findById(enterprise.getEnterpriseId())).thenReturn(Optional.of(enterprise));

        Enterprise result = service.findById(enterprise.getEnterpriseId());
        assertNotNull(result);
    }

    @Test
    void findById_success_ownerAccess() {
        mockSecurityContext(currentUser, "ROLE_ENTERPRISE");
        when(repository.findById(enterprise.getEnterpriseId())).thenReturn(Optional.of(enterprise));

        Enterprise result = service.findById(enterprise.getEnterpriseId());
        assertNotNull(result);
    }

    @Test
    void findById_unauthorized() {
        User otherUser = new User();
        otherUser.setEmail("other@test.com");
        otherUser.setEnterprise(null); // Không có enterprise
        mockSecurityContext(otherUser, "ROLE_ENTERPRISE");

        when(repository.findById(enterprise.getEnterpriseId())).thenReturn(Optional.of(enterprise));

        UUID id = enterprise.getEnterpriseId();
        AppException e = assertThrows(AppException.class, () -> service.findById(id));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void findById_notFound() {
        when(repository.findById(any())).thenReturn(Optional.empty());
        UUID randomId = UUID.randomUUID();
        AppException e = assertThrows(AppException.class, () -> service.findById(randomId));
        assertEquals(ErrorCode.ENTERPRISE_NOT_FOUND, e.getErrorCode());
    }

    @Test
    void save_success() {
        when(repository.save(any(Enterprise.class))).thenAnswer(i -> i.getArgument(0));

        Enterprise saved = service.save(request);
        assertNotNull(saved);
        assertEquals("Updated Company", saved.getCompanyName());
        assertEquals("PENDING", saved.getStatus());
    }

    @Test
    void save_success_withStatus() {
        request.setStatus("ACTIVE");
        when(repository.save(any(Enterprise.class))).thenAnswer(i -> i.getArgument(0));

        Enterprise saved = service.save(request);
        assertEquals("ACTIVE", saved.getStatus());
    }

    @Test
    void update_success() {
        mockSecurityContext(currentUser, "ROLE_ENTERPRISE");
        when(repository.findById(enterprise.getEnterpriseId())).thenReturn(Optional.of(enterprise));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(repository.save(any(Enterprise.class))).thenAnswer(i -> i.getArgument(0));

        Enterprise updated = service.update(enterprise.getEnterpriseId(), request);
        assertNotNull(updated);
        assertEquals("Updated Company", updated.getCompanyName());
        assertEquals("IT", updated.getIndustry());
        assertEquals("https://updated.com", updated.getWebsite());
        // Representative info mirrored to current user (fullName + phone only,
        // email is intentionally NOT overwritten to avoid invalidating the
        // current session / colliding with another user's unique email).
        assertEquals("Jane Doe", currentUser.getFullName());
        assertEquals("0987654321", currentUser.getPhone());
    }

    @Test
    void update_suspendedEnterprise_forbidden() {
        enterprise.setStatus("SUSPENDED");
        mockSecurityContext(currentUser, "ROLE_ENTERPRISE");
        when(repository.findById(enterprise.getEnterpriseId())).thenReturn(Optional.of(enterprise));

        UUID id = enterprise.getEnterpriseId();
        AppException e = assertThrows(AppException.class, () -> service.update(id, request));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void updateMyProfile_success() {
        mockSecurityContext(currentUser, "ROLE_ENTERPRISE");
        when(repository.findById(enterprise.getEnterpriseId())).thenReturn(Optional.of(enterprise));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(repository.save(any(Enterprise.class))).thenAnswer(i -> i.getArgument(0));

        Enterprise updated = service.updateMyProfile(request);
        assertNotNull(updated);
        assertEquals("Updated Company", updated.getCompanyName());
        assertEquals("Jane Doe", currentUser.getFullName());
    }

    @Test
    void update_unauthorized() {
        User otherUser = new User();
        otherUser.setEmail("other@test.com");
        Enterprise otherEnterprise = new Enterprise();
        otherEnterprise.setEnterpriseId(UUID.randomUUID());
        otherUser.setEnterprise(otherEnterprise);

        mockSecurityContext(otherUser, "ROLE_ENTERPRISE");
        when(repository.findById(enterprise.getEnterpriseId())).thenReturn(Optional.of(enterprise));

        UUID id = enterprise.getEnterpriseId();
        AppException e = assertThrows(AppException.class, () -> service.update(id, request));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void approveReject_approve_success() {
        when(repository.findById(enterprise.getEnterpriseId())).thenReturn(Optional.of(enterprise));
        when(repository.save(any(Enterprise.class))).thenAnswer(i -> i.getArgument(0));

        Enterprise result = service.approveReject(enterprise.getEnterpriseId(), "APPROVED", null);
        assertEquals("APPROVED", result.getStatus());
        assertNull(result.getRejectionReason());

        verify(mailService)
                .sendEnterpriseStatusNotification(
                        eq(enterprise.getContactEmail()), eq(enterprise.getContactPerson()), eq("APPROVED"), eq(null));
    }

    @Test
    void approveReject_reject_success() {
        when(repository.findById(enterprise.getEnterpriseId())).thenReturn(Optional.of(enterprise));
        when(repository.save(any(Enterprise.class))).thenAnswer(i -> i.getArgument(0));

        Enterprise result = service.approveReject(enterprise.getEnterpriseId(), "REJECTED", "Not enough info");
        assertEquals("REJECTED", result.getStatus());
        assertEquals("Not enough info", result.getRejectionReason());

        verify(mailService)
                .sendEnterpriseStatusNotification(
                        eq(enterprise.getContactEmail()),
                        eq(enterprise.getContactPerson()),
                        eq("REJECTED"),
                        eq("Not enough info"));
    }

    @Test
    void approveReject_reject_missingReason() {
        when(repository.findById(enterprise.getEnterpriseId())).thenReturn(Optional.of(enterprise));

        UUID id = enterprise.getEnterpriseId();
        AppException e = assertThrows(AppException.class, () -> service.approveReject(id, "REJECTED", "   "));
        assertEquals(ErrorCode.FIELD_REQUIRED, e.getErrorCode());
    }

    @Test
    void deleteById_success() {
        service.deleteById(UUID.randomUUID());
        verify(repository).deleteById(any());
    }
}
