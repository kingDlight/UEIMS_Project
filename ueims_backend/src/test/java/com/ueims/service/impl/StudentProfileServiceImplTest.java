package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.request.StudentProfileUpdateRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.Role;
import com.ueims.model.entity.StudentProfile;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.StudentProfileRepository;
import com.ueims.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class StudentProfileServiceImplTest {

    @Mock
    private StudentProfileRepository repository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    @InjectMocks
    private StudentProfileServiceImpl service;

    private User currentUser;
    private StudentProfile profile;
    private UUID profileId;

    @BeforeEach
    void setUp() {
        profileId = UUID.randomUUID();

        currentUser = new User();
        currentUser.setUserId(UUID.randomUUID());
        currentUser.setEmail("student@test.com");
        currentUser.setRoles(java.util.Collections.emptySet());

        profile = new StudentProfile();
        profile.setProfileId(profileId);
        profile.setUser(currentUser);
        profile.setMajor("SE");
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext(User user, String roleName) {
        if (roleName != null) {
            Role r = new Role();
            r.setRoleName(roleName);
            UserRole ur = new UserRole();
            ur.setRole(r);
            user.setRoles(java.util.Collections.singleton(ur));
        }

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user.getEmail(), null);
        SecurityContextHolder.getContext().setAuthentication(auth);
        lenient().when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    @Test
    void findAll_success() {
        when(repository.findAll()).thenReturn(List.of(profile));
        List<StudentProfile> result = service.findAll();
        assertEquals(1, result.size());
    }

    @Test
    void findById_success_admin() {
        User admin = new User();
        admin.setEmail("admin@test.com");
        mockSecurityContext(admin, "SYSTEM_ADMIN");
        when(repository.findById(profileId)).thenReturn(Optional.of(profile));

        StudentProfile result = service.findById(profileId);
        assertNotNull(result);
    }

    @Test
    void findById_success_studentOwner() {
        mockSecurityContext(currentUser, "STUDENT");
        when(repository.findById(profileId)).thenReturn(Optional.of(profile));

        StudentProfile result = service.findById(profileId);
        assertNotNull(result);
    }

    @Test
    void findById_unauthorized_studentNotOwner() {
        User otherStudent = new User();
        otherStudent.setUserId(UUID.randomUUID());
        otherStudent.setEmail("other@test.com");
        mockSecurityContext(otherStudent, "STUDENT");

        when(repository.findById(profileId)).thenReturn(Optional.of(profile));

        AppException e = assertThrows(AppException.class, () -> service.findById(profileId));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void findById_success_enterpriseWithApplication() {
        User enterpriseUser = new User();
        enterpriseUser.setUserId(UUID.randomUUID());
        enterpriseUser.setEmail("ent@test.com");
        Enterprise ent = new Enterprise();
        ent.setEnterpriseId(UUID.randomUUID());
        enterpriseUser.setEnterprise(ent);

        mockSecurityContext(enterpriseUser, "ENTERPRISE");
        when(repository.findById(profileId)).thenReturn(Optional.of(profile));
        when(applicationRepository.existsByJobPost_Enterprise_EnterpriseIdAndStudent_UserId(
                        ent.getEnterpriseId(), currentUser.getUserId()))
                .thenReturn(true);

        StudentProfile result = service.findById(profileId);
        assertNotNull(result);
    }

    @Test
    void findById_success_enterpriseWithAssignment() {
        User enterpriseUser = new User();
        enterpriseUser.setUserId(UUID.randomUUID());
        enterpriseUser.setEmail("ent@test.com");
        Enterprise ent = new Enterprise();
        ent.setEnterpriseId(UUID.randomUUID());
        enterpriseUser.setEnterprise(ent);

        mockSecurityContext(enterpriseUser, "ENTERPRISE");
        when(repository.findById(profileId)).thenReturn(Optional.of(profile));
        when(applicationRepository.existsByJobPost_Enterprise_EnterpriseIdAndStudent_UserId(
                        ent.getEnterpriseId(), currentUser.getUserId()))
                .thenReturn(false);
        when(enterpriseAssignmentRepository.existsByEnterprise_EnterpriseIdAndStudent_UserId(
                        ent.getEnterpriseId(), currentUser.getUserId()))
                .thenReturn(true);

        StudentProfile result = service.findById(profileId);
        assertNotNull(result);
    }

    @Test
    void findById_unauthorized_enterpriseNoLink() {
        User enterpriseUser = new User();
        enterpriseUser.setUserId(UUID.randomUUID());
        enterpriseUser.setEmail("ent@test.com");
        Enterprise ent = new Enterprise();
        ent.setEnterpriseId(UUID.randomUUID());
        enterpriseUser.setEnterprise(ent);

        mockSecurityContext(enterpriseUser, "ENTERPRISE");
        when(repository.findById(profileId)).thenReturn(Optional.of(profile));
        when(applicationRepository.existsByJobPost_Enterprise_EnterpriseIdAndStudent_UserId(any(), any()))
                .thenReturn(false);
        when(enterpriseAssignmentRepository.existsByEnterprise_EnterpriseIdAndStudent_UserId(any(), any()))
                .thenReturn(false);

        AppException e = assertThrows(AppException.class, () -> service.findById(profileId));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void save_success() {
        when(repository.save(any(StudentProfile.class))).thenReturn(profile);
        StudentProfile saved = service.save(profile);
        assertNotNull(saved);
    }

    @Test
    void updateProfile_success() {
        mockSecurityContext(currentUser, "STUDENT");
        when(repository.findById(profileId)).thenReturn(Optional.of(profile));
        when(repository.save(any(StudentProfile.class))).thenAnswer(i -> i.getArgument(0));

        StudentProfileUpdateRequest request = new StudentProfileUpdateRequest();
        request.setMajor("AI");
        request.setSkills("Java");

        StudentProfile updated = service.updateProfile(profileId, request);
        assertEquals("AI", updated.getMajor());
        assertEquals("Java", updated.getSkills());
    }

    @Test
    void updateProfile_unauthorized() {
        User otherUser = new User();
        otherUser.setUserId(UUID.randomUUID());
        otherUser.setEmail("other@test.com");
        mockSecurityContext(otherUser, "STUDENT");

        when(repository.findById(profileId)).thenReturn(Optional.of(profile));

        StudentProfileUpdateRequest request = new StudentProfileUpdateRequest();
        AppException e = assertThrows(AppException.class, () -> service.updateProfile(profileId, request));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void uploadCv_success() throws IOException {
        mockSecurityContext(currentUser, "STUDENT");
        when(repository.findById(profileId)).thenReturn(Optional.of(profile));
        when(repository.save(any(StudentProfile.class))).thenAnswer(i -> i.getArgument(0));

        // Create mock multipart file
        MultipartFile mockFile = new MockMultipartFile("file", "cv.pdf", "application/pdf", "dummy content".getBytes());

        StudentProfile updated = service.uploadCv(profileId, mockFile);
        assertNotNull(updated.getCvUrl());
        assertTrue(updated.getCvUrl().contains(".pdf"));

        // Clean up
        Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "cv");
        String filename = updated.getCvUrl().substring(updated.getCvUrl().lastIndexOf("/") + 1);
        Files.deleteIfExists(uploadDir.resolve(filename));
    }

    @Test
    void uploadCv_emptyFile() {
        mockSecurityContext(currentUser, "STUDENT");
        when(repository.findById(profileId)).thenReturn(Optional.of(profile));

        MultipartFile mockFile = new MockMultipartFile("file", new byte[0]);

        AppException e = assertThrows(AppException.class, () -> service.uploadCv(profileId, mockFile));
        assertEquals(ErrorCode.CV_NOT_UPLOADED, e.getErrorCode());
    }

    @Test
    void uploadCv_invalidFormat() {
        mockSecurityContext(currentUser, "STUDENT");
        when(repository.findById(profileId)).thenReturn(Optional.of(profile));

        MultipartFile mockFile = new MockMultipartFile("file", "cv.docx", "application/msword", "dummy".getBytes());

        AppException e = assertThrows(AppException.class, () -> service.uploadCv(profileId, mockFile));
        assertEquals(ErrorCode.INVALID_CV_FORMAT, e.getErrorCode());
    }

    @Test
    void uploadCv_sizeExceeded() {
        mockSecurityContext(currentUser, "STUDENT");
        when(repository.findById(profileId)).thenReturn(Optional.of(profile));

        byte[] largeContent = new byte[6 * 1024 * 1024]; // 6MB
        MultipartFile mockFile = new MockMultipartFile("file", "cv.pdf", "application/pdf", largeContent);

        AppException e = assertThrows(AppException.class, () -> service.uploadCv(profileId, mockFile));
        assertEquals(ErrorCode.CV_SIZE_EXCEEDED, e.getErrorCode());
    }

    @Test
    void deleteById_success() {
        service.deleteById(profileId);
        verify(repository).deleteById(profileId);
    }
}
