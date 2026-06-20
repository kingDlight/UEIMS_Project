package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
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

import com.ueims.dto.request.JobPostRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class JobPostServiceImplTest {

    @Mock
    private JobPostRepository repository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SemesterRepository semesterRepository;

    @InjectMocks
    private JobPostServiceImpl service;

    private User currentUser;
    private Enterprise enterprise;
    private Semester semester;
    private JobPost jobPost;
    private UUID jobPostId;

    @BeforeEach
    void setUp() {
        enterprise = new Enterprise();
        enterprise.setEnterpriseId(UUID.randomUUID());
        enterprise.setStatus("APPROVED");

        currentUser = new User();
        currentUser.setUserId(UUID.randomUUID());
        currentUser.setEmail("ent@test.com");
        currentUser.setEnterprise(enterprise);

        semester = new Semester();
        semester.setSemesterId(UUID.randomUUID());
        semester.setStatus("ACTIVE");

        jobPostId = UUID.randomUUID();
        jobPost = new JobPost();
        jobPost.setJobPostId(jobPostId);
        jobPost.setEnterprise(enterprise);
        jobPost.setSemester(semester);
        jobPost.setTitle("Software Engineer");
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
        when(repository.findAllByDeletedAtIsNull()).thenReturn(List.of(jobPost));
        List<JobPost> result = service.findAll();
        assertEquals(1, result.size());
    }

    @Test
    void findById_whenExists_returnsJobPost() {
        when(repository.findWithEnterpriseByJobPostId(jobPostId)).thenReturn(Optional.of(jobPost));
        JobPost result = service.findById(jobPostId);
        assertNotNull(result);
        assertEquals(jobPostId, result.getJobPostId());
    }

    @Test
    void findById_whenNotExists_throwsException() {
        when(repository.findWithEnterpriseByJobPostId(any())).thenReturn(Optional.empty());
        UUID randomId = UUID.randomUUID();
        AppException e = assertThrows(AppException.class, () -> service.findById(randomId));
        assertEquals(ErrorCode.JOB_POST_NOT_FOUND, e.getErrorCode());
    }

    @Test
    void create_success() {
        mockSecurityContext(currentUser);

        JobPostRequest request = new JobPostRequest();
        request.setTitle("Java Dev");
        request.setDescription("Desc");
        request.setPositionsCount(5);
        request.setApplicationDeadline(LocalDate.now().plusDays(10));
        JobPostRequest.SemesterRef reqSemester = new JobPostRequest.SemesterRef();
        reqSemester.setSemesterId(semester.getSemesterId());
        request.setSemester(reqSemester);

        when(semesterRepository.findById(semester.getSemesterId())).thenReturn(Optional.of(semester));
        when(repository.save(any(JobPost.class))).thenAnswer(i -> i.getArgument(0));

        JobPost created = service.create(request);

        assertNotNull(created);
        assertEquals("Java Dev", created.getTitle());
        assertEquals("OPEN", created.getStatus());
        assertEquals(enterprise, created.getEnterprise());
    }

    @Test
    void create_whenUserHasNoEnterprise_throwsException() {
        currentUser.setEnterprise(null);
        mockSecurityContext(currentUser);

        JobPostRequest request = new JobPostRequest();

        AppException e = assertThrows(AppException.class, () -> service.create(request));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void create_whenEnterpriseNotActive_throwsException() {
        enterprise.setStatus("PENDING");
        mockSecurityContext(currentUser);

        JobPostRequest request = new JobPostRequest();

        AppException e = assertThrows(AppException.class, () -> service.create(request));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void create_whenMissingSemester_throwsException() {
        mockSecurityContext(currentUser);

        JobPostRequest request = new JobPostRequest();

        AppException e = assertThrows(AppException.class, () -> service.create(request));
        assertEquals(ErrorCode.FIELD_REQUIRED, e.getErrorCode());
    }

    @Test
    void create_whenSemesterNotFound_throwsException() {
        mockSecurityContext(currentUser);

        JobPostRequest request = new JobPostRequest();
        JobPostRequest.SemesterRef reqSemester = new JobPostRequest.SemesterRef();
        reqSemester.setSemesterId(UUID.randomUUID());
        request.setSemester(reqSemester);

        when(semesterRepository.findById(any())).thenReturn(Optional.empty());

        AppException e = assertThrows(AppException.class, () -> service.create(request));
        assertEquals(ErrorCode.SEMESTER_NOT_FOUND, e.getErrorCode());
    }

    @Test
    void create_whenSemesterClosed_throwsException() {
        mockSecurityContext(currentUser);

        semester.setStatus("CLOSED");

        JobPostRequest request = new JobPostRequest();
        JobPostRequest.SemesterRef reqSemester = new JobPostRequest.SemesterRef();
        reqSemester.setSemesterId(semester.getSemesterId());
        request.setSemester(reqSemester);

        when(semesterRepository.findById(semester.getSemesterId())).thenReturn(Optional.of(semester));

        AppException e = assertThrows(AppException.class, () -> service.create(request));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void update_success() {
        mockSecurityContext(currentUser);
        jobPost.setCreatedBy(currentUser);
        when(repository.findWithEnterpriseByJobPostId(jobPostId)).thenReturn(Optional.of(jobPost));
        when(repository.save(any(JobPost.class))).thenAnswer(i -> i.getArgument(0));

        JobPostRequest request = new JobPostRequest();
        request.setTitle("Updated Title");
        request.setStatus("CLOSED");

        JobPost updated = service.update(jobPostId, request);

        assertEquals("Updated Title", updated.getTitle());
        assertEquals("CLOSED", updated.getStatus());
    }

    @Test
    void update_unauthorized_notOwner() {
        User otherUser = new User();
        otherUser.setUserId(UUID.randomUUID());
        otherUser.setEmail("other@test.com");
        Enterprise otherEnterprise = new Enterprise();
        otherEnterprise.setEnterpriseId(UUID.randomUUID());
        otherUser.setEnterprise(otherEnterprise);

        mockSecurityContext(otherUser);
        when(repository.findWithEnterpriseByJobPostId(jobPostId)).thenReturn(Optional.of(jobPost));

        JobPostRequest request = new JobPostRequest();

        AppException e = assertThrows(AppException.class, () -> service.update(jobPostId, request));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void deleteById_success() {
        mockSecurityContext(currentUser);
        jobPost.setCreatedBy(currentUser);
        when(repository.findWithEnterpriseByJobPostId(jobPostId)).thenReturn(Optional.of(jobPost));

        service.deleteById(jobPostId);

        verify(repository).save(jobPost);
        assertNotNull(jobPost.getDeletedAt());
    }
}
