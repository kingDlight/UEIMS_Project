package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Application;
import com.ueims.model.entity.ApplicationStatus;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.Interview;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.User;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.InterviewRepository;
import com.ueims.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class InterviewServiceImplTest {

    @Mock
    private InterviewRepository repository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InterviewServiceImpl service;

    private User currentUser;
    private Enterprise enterprise;
    private Application application;
    private JobPost jobPost;
    private Interview interview;
    private UUID interviewId;

    @BeforeEach
    void setUp() {
        enterprise = new Enterprise();
        enterprise.setEnterpriseId(UUID.randomUUID());

        currentUser = new User();
        currentUser.setUserId(UUID.randomUUID());
        currentUser.setEmail("test@test.com");
        currentUser.setEnterprise(enterprise);

        jobPost = new JobPost();
        jobPost.setJobPostId(UUID.randomUUID());
        jobPost.setEnterprise(enterprise);

        application = new Application();
        application.setApplicationId(UUID.randomUUID());
        application.setJobPost(jobPost);
        application.setStatus(ApplicationStatus.SCREENING_PASSED);
        User studentUser = new User();
        studentUser.setUserId(UUID.randomUUID());
        application.setStudent(studentUser);

        interviewId = UUID.randomUUID();
        interview = new Interview();
        interview.setInterviewId(interviewId);
        interview.setApplication(application);
        interview.setScheduledTime(LocalDateTime.now().plusDays(2));
        interview.setLocation("ONLINE");
        interview.setMeetingLink("http://meet.google.com");
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext(User user) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user.getEmail(), null);
        SecurityContextHolder.getContext().setAuthentication(auth);
        lenient().when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    @Test
    void findAll_returnsList() {
        when(repository.findAll()).thenReturn(List.of(interview));
        List<Interview> result = service.findAll();
        assertEquals(1, result.size());
    }

    @Test
    void findMyInterviews_success() {
        mockSecurityContext(currentUser);
        when(repository.findByApplication_Student_UserId(currentUser.getUserId()))
                .thenReturn(List.of(interview));

        List<Interview> result = service.findMyInterviews();
        assertEquals(1, result.size());
    }

    @Test
    void findById_success() {
        when(repository.findById(interviewId)).thenReturn(Optional.of(interview));
        Interview result = service.findById(interviewId);
        assertNotNull(result);
    }

    @Test
    void findById_notFound() {
        when(repository.findById(any())).thenReturn(Optional.empty());
        UUID randomId = UUID.randomUUID();
        AppException e = assertThrows(AppException.class, () -> service.findById(randomId));
        assertEquals(ErrorCode.INTERVIEW_NOT_FOUND, e.getErrorCode());
    }

    @Test
    void save_success() {
        mockSecurityContext(currentUser);
        when(applicationRepository.findById(application.getApplicationId())).thenReturn(Optional.of(application));
        when(repository.existsByEnterpriseAndTime(eq(enterprise.getEnterpriseId()), any()))
                .thenReturn(false);
        when(repository.saveAndFlush(any(Interview.class))).thenAnswer(i -> i.getArgument(0));

        Interview saved = service.save(interview);

        assertEquals(ApplicationStatus.INTERVIEW_SCHEDULED, application.getStatus());
        assertNotNull(saved);
    }

    @Test
    void save_whenPastDate_throwsException() {
        interview.setScheduledTime(LocalDateTime.now().minusDays(1));

        AppException e = assertThrows(AppException.class, () -> service.save(interview));
        assertEquals(ErrorCode.INTERVIEW_DATE_MUST_BE_IN_FUTURE, e.getErrorCode());
    }

    @Test
    void save_whenUnauthorized_throwsException() {
        mockSecurityContext(currentUser);

        Enterprise otherEnterprise = new Enterprise();
        otherEnterprise.setEnterpriseId(UUID.randomUUID());
        jobPost.setEnterprise(otherEnterprise); // Application belongs to a different enterprise

        when(applicationRepository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        AppException e = assertThrows(AppException.class, () -> service.save(interview));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void save_whenApplicationNotScreeningPassed_throwsException() {
        mockSecurityContext(currentUser);
        application.setStatus(ApplicationStatus.PENDING);

        when(applicationRepository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        AppException e = assertThrows(AppException.class, () -> service.save(interview));
        assertEquals(ErrorCode.INTERVIEW_ELIGIBILITY_RULE, e.getErrorCode());
    }

    @Test
    void save_whenOverlap_throwsException() {
        mockSecurityContext(currentUser);
        when(applicationRepository.findById(application.getApplicationId())).thenReturn(Optional.of(application));
        when(repository.existsByEnterpriseAndTime(eq(enterprise.getEnterpriseId()), any()))
                .thenReturn(true);

        AppException e = assertThrows(AppException.class, () -> service.save(interview));
        assertEquals(ErrorCode.INTERVIEW_OVERLAP, e.getErrorCode());
    }

    @Test
    void confirmAttendance_success() {
        when(repository.findById(interviewId)).thenReturn(Optional.of(interview));
        when(repository.save(any(Interview.class))).thenReturn(interview);

        Interview result = service.confirmAttendance(interviewId);
        assertTrue(result.getStudentConfirmed());
        assertEquals("CONFIRMED", result.getStatus());
    }

    @Test
    void confirmAttendance_whenAlreadyDeclined_throwsException() {
        interview.setStudentConfirmed(false);
        when(repository.findById(interviewId)).thenReturn(Optional.of(interview));

        AppException e = assertThrows(AppException.class, () -> service.confirmAttendance(interviewId));
        assertEquals(ErrorCode.APPLICATION_STATUS_CHANGED, e.getErrorCode());
    }

    @Test
    void declineAttendance_success() {
        when(repository.findById(interviewId)).thenReturn(Optional.of(interview));
        when(repository.save(any(Interview.class))).thenReturn(interview);

        Interview result = service.declineAttendance(interviewId, "Busy schedule");

        assertFalse(result.getStudentConfirmed());
        assertEquals("CANCELLED", result.getStatus());
        assertEquals("Busy schedule", result.getFeedback());
        assertEquals(ApplicationStatus.REJECTED, application.getStatus());
        assertTrue(application.getRejectionReason().contains("Busy schedule"));

        verify(applicationRepository).save(application);
    }

    @Test
    void declineAttendance_whenAlreadyConfirmed_throwsException() {
        interview.setStudentConfirmed(true);
        when(repository.findById(interviewId)).thenReturn(Optional.of(interview));

        AppException e = assertThrows(AppException.class, () -> service.declineAttendance(interviewId, "Reason"));
        assertEquals(ErrorCode.INTERVIEW_ALREADY_CONFIRMED, e.getErrorCode());
    }

    @Test
    void deleteById_success() {
        service.deleteById(interviewId);
        verify(repository).deleteById(interviewId);
    }
}
