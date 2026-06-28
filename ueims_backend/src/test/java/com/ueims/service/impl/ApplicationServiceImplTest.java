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

import com.ueims.dto.request.ApplicationRequest;
import com.ueims.dto.request.ApplicationScreenRequest;
import com.ueims.dto.response.ApplicationResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.mapper.ApplicationMapper;
import com.ueims.model.entity.*;
import com.ueims.repository.*;

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
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private com.ueims.repository.EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    @Mock
    private ApplicationMapper mapper;

    @InjectMocks
    private ApplicationServiceImpl service;

    private User currentUser;
    private Enterprise enterprise;
    private JobPost jobPost;
    private Semester semester;
    private EligibleStudent eligibleStudent;
    private Application application;

    @BeforeEach
    void setUp() {
        enterprise = new Enterprise();
        enterprise.setEnterpriseId(UUID.randomUUID());

        currentUser = new User();
        currentUser.setUserId(UUID.randomUUID());
        currentUser.setEmail("test@student.com");
        currentUser.setEnterprise(enterprise);

        semester = new Semester();
        semester.setSemesterId(UUID.randomUUID());

        jobPost = new JobPost();
        jobPost.setJobPostId(UUID.randomUUID());
        jobPost.setStatus("OPEN");
        jobPost.setSemester(semester);
        jobPost.setApplicationDeadline(LocalDate.now().plusDays(10));
        jobPost.setEnterprise(enterprise);

        eligibleStudent = new EligibleStudent();
        eligibleStudent.setUser(currentUser);
        eligibleStudent.setSemester(semester);
        eligibleStudent.setCurrentSemester(5);
        eligibleStudent.setGpa(new java.math.BigDecimal("6.0"));

        application = new Application();
        application.setApplicationId(UUID.randomUUID());
        application.setStudent(currentUser);
        application.setJobPost(jobPost);
        application.setStatus(ApplicationStatus.PENDING);
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext() {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(currentUser.getEmail(), null));
        lenient().when(userRepository.findByEmail(currentUser.getEmail())).thenReturn(Optional.of(currentUser));
    }

    // findAll
    @Test
    void findAll_success() {
        when(repository.findAll()).thenReturn(List.of(application));
        when(mapper.toApplicationResponse(application)).thenReturn(new ApplicationResponse());
        List<ApplicationResponse> list = service.findAll();
        assertEquals(1, list.size());
    }

    // findMyApplications
    @Test
    void findMyApplications_success() {
        mockSecurityContext();
        when(repository.findByStudent_UserId(currentUser.getUserId())).thenReturn(List.of(application));
        when(mapper.toApplicationResponse(application)).thenReturn(new ApplicationResponse());
        List<ApplicationResponse> list = service.findMyApplications();
        assertEquals(1, list.size());
    }

    // findById
    @Test
    void findById_success() {
        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));
        when(mapper.toApplicationResponse(application)).thenReturn(new ApplicationResponse());
        assertNotNull(service.findById(application.getApplicationId()));
    }

    @Test
    void findById_notFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());
        AppException e = assertThrows(AppException.class, () -> service.findById(id));
        assertEquals(ErrorCode.APPLICATION_NOT_FOUND, e.getErrorCode());
    }

    // applyForJob
    @Test
    void applyForJob_success() {
        ApplicationRequest req = ApplicationRequest.builder()
                .jobPostId(jobPost.getJobPostId())
                .studentId(currentUser.getUserId())
                .cvFileUrl("test.pdf")
                .cvFileSize(100L)
                .build();

        when(jobPostRepository.findById(req.getJobPostId())).thenReturn(Optional.of(jobPost));
        when(userRepository.findById(req.getStudentId())).thenReturn(Optional.of(currentUser));
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(eligibleStudent));
        when(repository.existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotInAndDeletedAtIsNull(
                        eq(jobPost.getJobPostId()), eq(currentUser.getUserId()), anyList()))
                .thenReturn(false);
        when(repository.countActiveApplications(currentUser.getUserId())).thenReturn(2L);
        when(repository.save(any(Application.class))).thenReturn(application);
        when(mapper.toApplicationResponse(application)).thenReturn(new ApplicationResponse());

        assertNotNull(service.applyForJob(req));
    }

    @Test
    void applyForJob_jobClosed() {
        jobPost.setStatus("CLOSED");
        ApplicationRequest req = ApplicationRequest.builder()
                .jobPostId(jobPost.getJobPostId())
                .studentId(currentUser.getUserId())
                .build();

        when(jobPostRepository.findById(req.getJobPostId())).thenReturn(Optional.of(jobPost));
        when(userRepository.findById(req.getStudentId())).thenReturn(Optional.of(currentUser));

        AppException e = assertThrows(AppException.class, () -> service.applyForJob(req));
        assertEquals(ErrorCode.JOB_POST_CLOSED, e.getErrorCode());
    }

    @Test
    void applyForJob_deadlineExpired() {
        jobPost.setApplicationDeadline(LocalDate.now().minusDays(1));
        ApplicationRequest req = ApplicationRequest.builder()
                .jobPostId(jobPost.getJobPostId())
                .studentId(currentUser.getUserId())
                .build();

        when(jobPostRepository.findById(req.getJobPostId())).thenReturn(Optional.of(jobPost));
        when(userRepository.findById(req.getStudentId())).thenReturn(Optional.of(currentUser));

        AppException e = assertThrows(AppException.class, () -> service.applyForJob(req));
        assertEquals(ErrorCode.APPLICATION_DEADLINE_EXPIRED, e.getErrorCode());
    }

    @Test
    void applyForJob_notSemester5() {
        eligibleStudent.setCurrentSemester(4);
        ApplicationRequest req = ApplicationRequest.builder()
                .jobPostId(jobPost.getJobPostId())
                .studentId(currentUser.getUserId())
                .build();

        when(jobPostRepository.findById(req.getJobPostId())).thenReturn(Optional.of(jobPost));
        when(userRepository.findById(req.getStudentId())).thenReturn(Optional.of(currentUser));
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(eligibleStudent));

        AppException e = assertThrows(AppException.class, () -> service.applyForJob(req));
        assertEquals(ErrorCode.STUDENT_NOT_IN_SEMESTER_5, e.getErrorCode());
    }

    @Test
    void applyForJob_duplicateApplication() {
        ApplicationRequest req = ApplicationRequest.builder()
                .jobPostId(jobPost.getJobPostId())
                .studentId(currentUser.getUserId())
                .build();

        when(jobPostRepository.findById(req.getJobPostId())).thenReturn(Optional.of(jobPost));
        when(userRepository.findById(req.getStudentId())).thenReturn(Optional.of(currentUser));
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(eligibleStudent));
        when(repository.existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotInAndDeletedAtIsNull(
                        eq(jobPost.getJobPostId()), eq(currentUser.getUserId()), anyList()))
                .thenReturn(true);

        AppException e = assertThrows(AppException.class, () -> service.applyForJob(req));
        assertEquals(ErrorCode.DUPLICATE_APPLICATION, e.getErrorCode());
    }

    @Test
    void applyForJob_maxLimitReached() {
        ApplicationRequest req = ApplicationRequest.builder()
                .jobPostId(jobPost.getJobPostId())
                .studentId(currentUser.getUserId())
                .build();

        when(jobPostRepository.findById(req.getJobPostId())).thenReturn(Optional.of(jobPost));
        when(userRepository.findById(req.getStudentId())).thenReturn(Optional.of(currentUser));
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(eligibleStudent));
        when(repository.existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotInAndDeletedAtIsNull(
                        eq(jobPost.getJobPostId()), eq(currentUser.getUserId()), anyList()))
                .thenReturn(false);
        when(repository.countActiveApplications(currentUser.getUserId())).thenReturn(3L);

        AppException e = assertThrows(AppException.class, () -> service.applyForJob(req));
        assertEquals(ErrorCode.MAX_APPLICATIONS_LIMIT_REACHED, e.getErrorCode());
    }

    @Test
    void applyForJob_cvMissing() {
        ApplicationRequest req = ApplicationRequest.builder()
                .jobPostId(jobPost.getJobPostId())
                .studentId(currentUser.getUserId())
                .cvFileUrl("   ")
                .build();

        when(jobPostRepository.findById(req.getJobPostId())).thenReturn(Optional.of(jobPost));
        when(userRepository.findById(req.getStudentId())).thenReturn(Optional.of(currentUser));
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(eligibleStudent));
        when(repository.existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotInAndDeletedAtIsNull(
                        eq(jobPost.getJobPostId()), eq(currentUser.getUserId()), anyList()))
                .thenReturn(false);
        when(repository.countActiveApplications(currentUser.getUserId())).thenReturn(2L);

        AppException e = assertThrows(AppException.class, () -> service.applyForJob(req));
        assertEquals(ErrorCode.CV_NOT_UPLOADED, e.getErrorCode());
    }

    @Test
    void applyForJob_invalidCvFormat() {
        ApplicationRequest req = ApplicationRequest.builder()
                .jobPostId(jobPost.getJobPostId())
                .studentId(currentUser.getUserId())
                .cvFileUrl("test.docx")
                .build();

        when(jobPostRepository.findById(req.getJobPostId())).thenReturn(Optional.of(jobPost));
        when(userRepository.findById(req.getStudentId())).thenReturn(Optional.of(currentUser));
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(eligibleStudent));
        when(repository.existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotInAndDeletedAtIsNull(
                        eq(jobPost.getJobPostId()), eq(currentUser.getUserId()), anyList()))
                .thenReturn(false);
        when(repository.countActiveApplications(currentUser.getUserId())).thenReturn(2L);

        AppException e = assertThrows(AppException.class, () -> service.applyForJob(req));
        assertEquals(ErrorCode.INVALID_CV_FORMAT, e.getErrorCode());
    }

    @Test
    void applyForJob_cvSizeExceeded() {
        ApplicationRequest req = ApplicationRequest.builder()
                .jobPostId(jobPost.getJobPostId())
                .studentId(currentUser.getUserId())
                .cvFileUrl("test.pdf")
                .cvFileSize(6000000L) // > 5MB
                .build();

        when(jobPostRepository.findById(req.getJobPostId())).thenReturn(Optional.of(jobPost));
        when(userRepository.findById(req.getStudentId())).thenReturn(Optional.of(currentUser));
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(eligibleStudent));
        when(repository.existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotInAndDeletedAtIsNull(
                        eq(jobPost.getJobPostId()), eq(currentUser.getUserId()), anyList()))
                .thenReturn(false);
        when(repository.countActiveApplications(currentUser.getUserId())).thenReturn(2L);

        AppException e = assertThrows(AppException.class, () -> service.applyForJob(req));
        assertEquals(ErrorCode.CV_SIZE_EXCEEDED, e.getErrorCode());
    }

    // deleteById
    @Test
    void deleteById_success() {
        service.deleteById(UUID.randomUUID());
        verify(repository).deleteById(any());
    }

    // withdrawApplication
    @Test
    void withdrawApplication_success() {
        mockSecurityContext();
        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));
        when(repository.save(application)).thenReturn(application);
        when(mapper.toApplicationResponse(application)).thenReturn(new ApplicationResponse());

        service.withdrawApplication(application.getApplicationId());
        assertEquals(ApplicationStatus.WITHDRAWN, application.getStatus());
    }

    @Test
    void withdrawApplication_unauthorized() {
        mockSecurityContext();
        User otherUser = new User();
        otherUser.setUserId(UUID.randomUUID());
        application.setStudent(otherUser);

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        UUID id = application.getApplicationId();
        AppException e = assertThrows(AppException.class, () -> service.withdrawApplication(id));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void withdrawApplication_statusChanged() {
        mockSecurityContext();
        application.setStatus(ApplicationStatus.SCREENING_REJECTED);

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        UUID id = application.getApplicationId();
        AppException e = assertThrows(AppException.class, () -> service.withdrawApplication(id));
        assertEquals(ErrorCode.APPLICATION_STATUS_CHANGED, e.getErrorCode());
    }

    @Test
    void withdrawApplication_deadlineExpired() {
        mockSecurityContext();
        jobPost.setApplicationDeadline(LocalDate.now().minusDays(1)); // passed
        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        UUID id = application.getApplicationId();
        AppException e = assertThrows(AppException.class, () -> service.withdrawApplication(id));
        assertEquals(ErrorCode.APPLICATION_DEADLINE_EXPIRED, e.getErrorCode());
    }

    // screenApplication
    @Test
    void screenApplication_success() {
        mockSecurityContext();
        ApplicationScreenRequest req = ApplicationScreenRequest.builder()
                .status(ApplicationStatus.SCREENING_PASSED)
                .build();

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));
        when(repository.save(application)).thenReturn(application);
        when(mapper.toApplicationResponse(application)).thenReturn(new ApplicationResponse());

        service.screenApplication(application.getApplicationId(), req);
        assertEquals(ApplicationStatus.SCREENING_PASSED, application.getStatus());
    }

    @Test
    void screenApplication_rejected() {
        mockSecurityContext();
        ApplicationScreenRequest req = ApplicationScreenRequest.builder()
                .status(ApplicationStatus.SCREENING_REJECTED)
                .rejectionReason("Not suitable")
                .build();

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));
        when(repository.save(application)).thenReturn(application);
        when(mapper.toApplicationResponse(application)).thenReturn(new ApplicationResponse());

        service.screenApplication(application.getApplicationId(), req);
        assertEquals(ApplicationStatus.SCREENING_REJECTED, application.getStatus());
        assertEquals("Not suitable", application.getRejectionReason());
    }

    @Test
    void screenApplication_unauthorized() {
        mockSecurityContext();
        Enterprise otherEnterprise = new Enterprise();
        otherEnterprise.setEnterpriseId(UUID.randomUUID());
        jobPost.setEnterprise(otherEnterprise); // current user's enterprise is different

        ApplicationScreenRequest req = ApplicationScreenRequest.builder()
                .status(ApplicationStatus.SCREENING_PASSED)
                .build();

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        UUID id = application.getApplicationId();
        AppException e = assertThrows(AppException.class, () -> service.screenApplication(id, req));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void screenApplication_invalidStatus() {
        mockSecurityContext();
        ApplicationScreenRequest req = ApplicationScreenRequest.builder()
                .status(ApplicationStatus.INTERVIEW_SCHEDULED) // Only PASSED/REJECTED allowed
                .build();

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        UUID id = application.getApplicationId();
        AppException e = assertThrows(AppException.class, () -> service.screenApplication(id, req));
        assertEquals(ErrorCode.INVALID_PARAMETER_FORMAT, e.getErrorCode());
    }

    @Test
    void screenApplication_notPending() {
        mockSecurityContext();
        application.setStatus(ApplicationStatus.SCREENING_PASSED); // already screened
        ApplicationScreenRequest req = ApplicationScreenRequest.builder()
                .status(ApplicationStatus.SCREENING_REJECTED)
                .build();

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        UUID id = application.getApplicationId();
        AppException e = assertThrows(AppException.class, () -> service.screenApplication(id, req));
        assertEquals(ErrorCode.APPLICATION_STATUS_CHANGED, e.getErrorCode());
    }

    @Test
    void bulkDownloadCv_success() {
        mockSecurityContext();
        application.setCvFileUrl("http://example.com/test.pdf");
        when(repository.findAllById(any())).thenReturn(List.of(application));

        org.springframework.core.io.Resource res = service.bulkDownloadCv(List.of(application.getApplicationId()));
        assertNotNull(res);
        assertTrue(res.exists());
    }

    @Test
    void bulkDownloadCv_unauthorized() {
        mockSecurityContext();
        Enterprise otherEnterprise = new Enterprise();
        otherEnterprise.setEnterpriseId(UUID.randomUUID());
        jobPost.setEnterprise(otherEnterprise); // different enterprise
        when(repository.findAllById(any())).thenReturn(List.of(application));

        List<UUID> ids = List.of(application.getApplicationId());
        AppException e = assertThrows(AppException.class, () -> service.bulkDownloadCv(ids));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void bulkDownloadCv_invalidParam() {
        AppException e = assertThrows(AppException.class, () -> service.bulkDownloadCv(List.of()));
        assertEquals(ErrorCode.INVALID_PARAMETER_FORMAT, e.getErrorCode());
    }

    // findByEnterpriseId
    @Test
    void findByEnterpriseId_success() {
        mockSecurityContext();
        when(repository.findByJobPost_Enterprise_EnterpriseIdAndDeletedAtIsNull(enterprise.getEnterpriseId()))
                .thenReturn(List.of(application));
        when(mapper.toApplicationResponse(application)).thenReturn(new ApplicationResponse());

        List<ApplicationResponse> list = service.findByEnterpriseId(null, null);
        assertEquals(1, list.size());
    }

    @Test
    void findByEnterpriseId_withSearch_success() {
        mockSecurityContext();
        when(repository.searchByEnterpriseId(enterprise.getEnterpriseId(), "test"))
                .thenReturn(List.of(application));
        when(mapper.toApplicationResponse(application)).thenReturn(new ApplicationResponse());

        List<ApplicationResponse> list = service.findByEnterpriseId(null, " test ");
        assertEquals(1, list.size());
    }

    @Test
    void findByEnterpriseId_noEnterprise_returnsEmpty() {
        currentUser.setEnterprise(null);
        mockSecurityContext();
        List<ApplicationResponse> list = service.findByEnterpriseId(null, null);
        assertTrue(list.isEmpty());
    }

    // updateStatus
    @Test
    void updateStatus_success() {
        mockSecurityContext();
        com.ueims.dto.request.ApplicationStatusUpdateRequest req =
                new com.ueims.dto.request.ApplicationStatusUpdateRequest();
        req.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        req.setInterviewDate("2026-06-28T10:00:00");
        req.setInterviewLink("http://meet.google.com");

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));
        when(repository.save(application)).thenReturn(application);
        when(mapper.toApplicationResponse(application)).thenReturn(new ApplicationResponse());

        service.updateStatus(application.getApplicationId(), req);
        assertEquals(ApplicationStatus.INTERVIEW_SCHEDULED, application.getStatus());
        assertNotNull(application.getInterviewDate());
        assertEquals("http://meet.google.com", application.getInterviewLink());
    }

    @Test
    void updateStatus_acceptedTriggerCascade() {
        mockSecurityContext();
        com.ueims.dto.request.ApplicationStatusUpdateRequest req =
                new com.ueims.dto.request.ApplicationStatusUpdateRequest();
        req.setStatus(ApplicationStatus.ACCEPTED);

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));
        when(repository.save(application)).thenReturn(application);
        when(mapper.toApplicationResponse(application)).thenReturn(new ApplicationResponse());

        // Mock withdrawOtherApplicationsInSemester dependencies
        Application otherApp = new Application();
        otherApp.setApplicationId(UUID.randomUUID());
        otherApp.setStudent(currentUser);
        otherApp.setJobPost(jobPost);
        otherApp.setStatus(ApplicationStatus.PENDING);

        when(repository.findByStudent_UserId(currentUser.getUserId())).thenReturn(List.of(application, otherApp));

        service.updateStatus(application.getApplicationId(), req);
        assertEquals(ApplicationStatus.ACCEPTED, application.getStatus());
        assertEquals(ApplicationStatus.WITHDRAWN, otherApp.getStatus());
    }

    @Test
    void updateStatus_invalidDate_throwsException() {
        mockSecurityContext();
        com.ueims.dto.request.ApplicationStatusUpdateRequest req =
                new com.ueims.dto.request.ApplicationStatusUpdateRequest();
        req.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        req.setInterviewDate("invalid-date");

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        AppException e =
                assertThrows(AppException.class, () -> service.updateStatus(application.getApplicationId(), req));
        assertEquals(ErrorCode.INVALID_PARAMETER_FORMAT, e.getErrorCode());
    }

    @Test
    void updateStatus_unauthorized() {
        mockSecurityContext();
        Enterprise otherEnterprise = new Enterprise();
        otherEnterprise.setEnterpriseId(UUID.randomUUID());
        jobPost.setEnterprise(otherEnterprise);

        com.ueims.dto.request.ApplicationStatusUpdateRequest req =
                new com.ueims.dto.request.ApplicationStatusUpdateRequest();

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        AppException e =
                assertThrows(AppException.class, () -> service.updateStatus(application.getApplicationId(), req));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void updateStatus_jobClosed() {
        mockSecurityContext();
        jobPost.setStatus("CLOSED");

        com.ueims.dto.request.ApplicationStatusUpdateRequest req =
                new com.ueims.dto.request.ApplicationStatusUpdateRequest();

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        AppException e =
                assertThrows(AppException.class, () -> service.updateStatus(application.getApplicationId(), req));
        assertEquals(ErrorCode.JOB_POST_CLOSED, e.getErrorCode());
    }

    @Test
    void updateStatus_withdrawnApp() {
        mockSecurityContext();
        application.setStatus(ApplicationStatus.WITHDRAWN);

        com.ueims.dto.request.ApplicationStatusUpdateRequest req =
                new com.ueims.dto.request.ApplicationStatusUpdateRequest();

        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        AppException e =
                assertThrows(AppException.class, () -> service.updateStatus(application.getApplicationId(), req));
        assertEquals(ErrorCode.INVALID_PARAMETER_FORMAT, e.getErrorCode());
    }

    // downloadCv
    @Test
    void downloadCv_emptyUrl() {
        mockSecurityContext();
        application.setCvFileUrl("");
        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        AppException e = assertThrows(AppException.class, () -> service.downloadCv(application.getApplicationId()));
        assertEquals(ErrorCode.FILE_NOT_FOUND, e.getErrorCode());
    }

    @Test
    void downloadCv_externalUrl_success() {
        mockSecurityContext();
        application.setCvFileUrl("http://example.com/cv.pdf");
        when(repository.findById(application.getApplicationId())).thenReturn(Optional.of(application));

        org.springframework.core.io.Resource res = service.downloadCv(application.getApplicationId());
        assertNotNull(res);
        verify(repository).incrementDownloadCount(application.getApplicationId());
    }
}
