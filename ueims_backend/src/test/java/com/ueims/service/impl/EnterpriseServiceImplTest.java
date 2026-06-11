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

    static class MockMailService extends MailService {
        String lastTo;
        String lastStatus;
        String lastReason;

        public MockMailService() {
            super(null, null);
        }

        @Override
        public void sendEnterpriseStatusNotification(String to, String contactPerson, String status, String reason) {
            this.lastTo = to;
            this.lastStatus = status;
            this.lastReason = reason;
        }
    }

    private MockMailService mailService;

    private EnterpriseServiceImpl service;

    private Enterprise enterprise;
    private User currentUser;
    private EnterpriseRequest request;

    @BeforeEach
    void setUp() {
        mailService = new MockMailService();
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
        when(repository.findAll()).thenReturn(List.of(enterprise));
        List<Enterprise> list = service.findAll();
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
        assertEquals("Jane Doe", currentUser.getFullName());
        assertEquals("updated@company.com", currentUser.getEmail());
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

        assertEquals(enterprise.getContactEmail(), mailService.lastTo);
        assertEquals("APPROVED", mailService.lastStatus);
    }

    @Test
    void approveReject_reject_success() {
        when(repository.findById(enterprise.getEnterpriseId())).thenReturn(Optional.of(enterprise));
        when(repository.save(any(Enterprise.class))).thenAnswer(i -> i.getArgument(0));

        Enterprise result = service.approveReject(enterprise.getEnterpriseId(), "REJECTED", "Not enough info");
        assertEquals("REJECTED", result.getStatus());
        assertEquals("Not enough info", result.getRejectionReason());

        assertEquals(enterprise.getContactEmail(), mailService.lastTo);
        assertEquals("REJECTED", mailService.lastStatus);
        assertEquals("Not enough info", mailService.lastReason);
    }

    @Test
    void approveReject_reject_missingReason() {
        when(repository.findById(enterprise.getEnterpriseId())).thenReturn(Optional.of(enterprise));

        UUID id = enterprise.getEnterpriseId();
        AppException e = assertThrows(
                AppException.class, () -> service.approveReject(id, "REJECTED", "   "));
        assertEquals(ErrorCode.FIELD_REQUIRED, e.getErrorCode());
    }

    @Test
    void deleteById_success() {
        service.deleteById(UUID.randomUUID());
        verify(repository).deleteById(any());
    }
}
