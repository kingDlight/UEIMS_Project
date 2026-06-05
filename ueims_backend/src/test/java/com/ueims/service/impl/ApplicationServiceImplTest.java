package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ueims.dto.response.ApplicationResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.mapper.ApplicationMapper;
import com.ueims.model.entity.Application;
import com.ueims.model.entity.ApplicationStatus;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.User;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceImplTest {

    @Mock
    private ApplicationRepository repository;

    @Mock
    private JobPostRepository jobPostRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EligibleStudentRepository eligibleStudentRepository;

    @Mock
    private ApplicationMapper mapper;

    @InjectMocks
    private ApplicationServiceImpl service;

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void withdrawApplication_whenOwnerAndPending_updatesToWithdrawn() {
        UUID applicationId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        User student =
                User.builder().userId(studentId).email("student@example.com").build();
        JobPost jobPost = JobPost.builder()
                .applicationDeadline(LocalDate.now().plusDays(1))
                .build();
        Application application = Application.builder()
                .applicationId(applicationId)
                .student(student)
                .jobPost(jobPost)
                .status(ApplicationStatus.PENDING)
                .build();

        when(repository.findById(applicationId)).thenReturn(Optional.of(application));
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));
        when(repository.save(any(Application.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(mapper.toApplicationResponse(any(Application.class)))
                .thenReturn(ApplicationResponse.builder()
                        .applicationId(applicationId)
                        .status("WITHDRAWN")
                        .build());

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("student@example.com", null));

        ApplicationResponse result = service.withdrawApplication(applicationId);

        assertNotNull(result);
        assertEquals(applicationId, result.getApplicationId());
        assertEquals("WITHDRAWN", result.getStatus());
        assertEquals(ApplicationStatus.WITHDRAWN, application.getStatus());
    }

    @Test
    void withdrawApplication_whenNotOwner_throwsUnauthorized() {
        UUID applicationId = UUID.randomUUID();
        User student = User.builder()
                .userId(UUID.randomUUID())
                .email("student1@example.com")
                .build();
        User currentUser = User.builder()
                .userId(UUID.randomUUID())
                .email("student2@example.com")
                .build();
        JobPost jobPost = JobPost.builder()
                .applicationDeadline(LocalDate.now().plusDays(1))
                .build();
        Application application = Application.builder()
                .applicationId(applicationId)
                .student(student)
                .jobPost(jobPost)
                .status(ApplicationStatus.PENDING)
                .build();

        when(repository.findById(applicationId)).thenReturn(Optional.of(application));
        when(userRepository.findByEmail("student2@example.com")).thenReturn(Optional.of(currentUser));

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("student2@example.com", null));

        AppException exception = assertThrows(AppException.class, () -> service.withdrawApplication(applicationId));
        assertEquals(ErrorCode.UNAUTHORIZED, exception.getErrorCode());
    }

    @Test
    void withdrawApplication_whenStatusNotPending_throwsApplicationStatusChanged() {
        UUID applicationId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        User student =
                User.builder().userId(studentId).email("student@example.com").build();
        JobPost jobPost = JobPost.builder()
                .applicationDeadline(LocalDate.now().plusDays(1))
                .build();
        Application application = Application.builder()
                .applicationId(applicationId)
                .student(student)
                .jobPost(jobPost)
                .status(ApplicationStatus.WITHDRAWN)
                .build();

        when(repository.findById(applicationId)).thenReturn(Optional.of(application));
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("student@example.com", null));

        AppException exception = assertThrows(AppException.class, () -> service.withdrawApplication(applicationId));
        assertEquals(ErrorCode.APPLICATION_STATUS_CHANGED, exception.getErrorCode());
    }
}
