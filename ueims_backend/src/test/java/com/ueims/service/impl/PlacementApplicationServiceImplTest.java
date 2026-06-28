package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.dto.request.ManualMatchRequest;
import com.ueims.dto.request.PlacementApplicationRequest;
import com.ueims.dto.request.RejectApplicationRequest;
import com.ueims.dto.response.PlacementApplicationResponseDTO;
import com.ueims.mapper.PlacementApplicationMapper;
import com.ueims.model.entity.*;
import com.ueims.repository.*;

@ExtendWith(MockitoExtension.class)
class PlacementApplicationServiceImplTest {

    @Mock
    private PlacementApplicationRepository applicationRepository;

    @Mock
    private EnterpriseAssignmentRepository assignmentRepository;

    @Mock
    private EligibleStudentRepository eligibleRepository;

    @Mock
    private EnterpriseRepository enterpriseRepository;

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PlacementApplicationMapper mapper;

    @InjectMocks
    private PlacementApplicationServiceImpl service;

    private User student;
    private User reviewer;
    private Enterprise enterprise;
    private Semester semester;
    private EligibleStudent eligibleStudent;
    private PlacementApplication application;
    private UUID studentId;
    private UUID enterpriseId;
    private UUID semesterId;
    private UUID applicationId;
    private UUID reviewerId;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        enterpriseId = UUID.randomUUID();
        semesterId = UUID.randomUUID();
        applicationId = UUID.randomUUID();
        reviewerId = UUID.randomUUID();

        student = User.builder().userId(studentId).email("student@test.com").build();
        reviewer = User.builder().userId(reviewerId).email("reviewer@test.com").build();

        enterprise = Enterprise.builder()
                .enterpriseId(enterpriseId)
                .companyName("VNG")
                .status("APPROVED")
                .build();

        semester = Semester.builder().semesterId(semesterId).status("ACTIVE").build();

        eligibleStudent = EligibleStudent.builder()
                .user(student)
                .semester(semester)
                .status("MATCHED")
                .build();

        application = PlacementApplication.builder()
                .applicationId(applicationId)
                .student(student)
                .enterprise(enterprise)
                .semester(semester)
                .status("PENDING_APPROVAL")
                .build();
    }

    private void mockActiveSemester() {
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(semester));
    }

    @Test
    void apply_success() {
        PlacementApplicationRequest request = new PlacementApplicationRequest();
        request.setEnterpriseId(enterpriseId);
        request.setCoverLetter("Hello");

        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(enterpriseRepository.findById(enterpriseId)).thenReturn(Optional.of(enterprise));
        mockActiveSemester();
        when(eligibleRepository.findByUser_UserIdAndSemester_SemesterId(studentId, semesterId))
                .thenReturn(Optional.of(eligibleStudent));
        when(assignmentRepository.findByStudent_UserIdAndSemester_Status(studentId, "ACTIVE"))
                .thenReturn(Optional.empty());
        when(applicationRepository.existsActiveAssignmentForStudentInSemester(studentId, semesterId))
                .thenReturn(false);
        when(applicationRepository.findByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
                        studentId, enterpriseId, semesterId))
                .thenReturn(Optional.empty());

        when(applicationRepository.save(any(PlacementApplication.class))).thenReturn(application);
        PlacementApplicationResponseDTO dto = new PlacementApplicationResponseDTO();
        when(mapper.toDto(any(PlacementApplication.class))).thenReturn(dto);

        PlacementApplicationResponseDTO result = service.apply(studentId, request);
        assertNotNull(result);
    }

    @Test
    void approve_success() {
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
        when(applicationRepository.existsActiveAssignmentForStudentInSemester(studentId, semesterId))
                .thenReturn(false);
        when(userRepository.findById(reviewerId)).thenReturn(Optional.of(reviewer));

        EnterpriseAssignment newAssignment = EnterpriseAssignment.builder()
                .assignmentId(UUID.randomUUID())
                .status("ACTIVE")
                .build();
        when(assignmentRepository.save(any(EnterpriseAssignment.class))).thenReturn(newAssignment);
        when(applicationRepository.save(any(PlacementApplication.class))).thenReturn(application);

        PlacementApplicationResponseDTO dto = new PlacementApplicationResponseDTO();
        when(mapper.toDto(application)).thenReturn(dto);

        PlacementApplicationResponseDTO result = service.approve(applicationId, reviewerId);
        assertNotNull(result);
        assertEquals("APPROVED", application.getStatus());
    }

    @Test
    void reject_success() {
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
        when(userRepository.findById(reviewerId)).thenReturn(Optional.of(reviewer));
        when(applicationRepository.save(any(PlacementApplication.class))).thenReturn(application);

        RejectApplicationRequest request = new RejectApplicationRequest();
        request.setRejectionReason("Not suitable");

        PlacementApplicationResponseDTO dto = new PlacementApplicationResponseDTO();
        when(mapper.toDto(application)).thenReturn(dto);

        PlacementApplicationResponseDTO result = service.reject(applicationId, reviewerId, request);
        assertNotNull(result);
        assertEquals("REJECTED", application.getStatus());
    }

    @Test
    void withdraw_success() {
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(PlacementApplication.class))).thenReturn(application);

        PlacementApplicationResponseDTO dto = new PlacementApplicationResponseDTO();
        when(mapper.toDto(application)).thenReturn(dto);

        PlacementApplicationResponseDTO result = service.withdraw(applicationId, studentId);
        assertNotNull(result);
        assertEquals("WITHDRAWN", application.getStatus());
    }

    @Test
    void manualMatch_success() {
        ManualMatchRequest request = new ManualMatchRequest();
        request.setStudentId(studentId);
        request.setEnterpriseId(enterpriseId);

        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(enterpriseRepository.findById(enterpriseId)).thenReturn(Optional.of(enterprise));
        mockActiveSemester();
        when(eligibleRepository.findByUser_UserIdAndSemester_SemesterId(studentId, semesterId))
                .thenReturn(Optional.of(eligibleStudent));
        when(applicationRepository.existsActiveAssignmentForStudentInSemester(studentId, semesterId))
                .thenReturn(false);
        when(applicationRepository.findByStatusAndSemester("PENDING_APPROVAL", semesterId))
                .thenReturn(List.of());
        when(userRepository.findById(reviewerId)).thenReturn(Optional.of(reviewer));

        when(applicationRepository.save(any(PlacementApplication.class))).thenReturn(application);
        when(assignmentRepository.save(any(EnterpriseAssignment.class))).thenReturn(new EnterpriseAssignment());

        PlacementApplicationResponseDTO dto = new PlacementApplicationResponseDTO();
        when(mapper.toDto(application)).thenReturn(dto);

        PlacementApplicationResponseDTO result = service.manualMatch(reviewerId, request);
        assertNotNull(result);
    }
}
