package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.dto.response.OjtStatusResponse;
import com.ueims.model.entity.*;
import com.ueims.repository.*;

@ExtendWith(MockitoExtension.class)
class OjtStatusServiceImplTest {

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private EligibleStudentRepository eligibleStudentRepository;

    @Mock
    private EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private WeeklyReportRepository weeklyReportRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SemesterEnterpriseRepository semesterEnterpriseRepository;

    @InjectMocks
    private OjtStatusServiceImpl service;

    private User user;
    private Semester activeSemester;
    private UUID userId;
    private UUID semesterId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User();
        user.setUserId(userId);
        user.setEmail("student@fpt.edu.vn");

        semesterId = UUID.randomUUID();
        activeSemester = new Semester();
        activeSemester.setSemesterId(semesterId);
        activeSemester.setName("Fall 2026");
        activeSemester.setStatus("ACTIVE");
        activeSemester.setEndDate(LocalDate.now().plusDays(30));
    }

    @Test
    void getOjtStatus_UserNotFound_ReturnsDefault() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        OjtStatusResponse response = service.getOjtStatusForCurrentUser("unknown@fpt.edu.vn");

        assertEquals(OjtStatus.NOT_APPLICABLE, response.ojtStatus());
        assertEquals("Chưa có thông tin", response.statusLabel());
    }

    @Test
    void getOjtStatus_NoActiveSemester_ReturnsDefault() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of());

        OjtStatusResponse response = service.getOjtStatusForCurrentUser("student@fpt.edu.vn");

        assertEquals(OjtStatus.NOT_APPLICABLE, response.ojtStatus());
    }

    @Test
    void getOjtStatus_SemesterLessThan5_ReturnsNotApplicable() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeSemester));

        EligibleStudent eligible = new EligibleStudent();
        eligible.setCurrentSemester(4);
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(userId, semesterId))
                .thenReturn(Optional.of(eligible));

        OjtStatusResponse response = service.getOjtStatusForCurrentUser("student@fpt.edu.vn");

        assertEquals(OjtStatus.NOT_APPLICABLE, response.ojtStatus());
        assertEquals("ĐANG HỌC KỲ THƯỜNG", response.statusLabel());
    }

    @Test
    void getOjtStatus_Semester5_ReturnsPreparing() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeSemester));

        EligibleStudent eligible = new EligibleStudent();
        eligible.setCurrentSemester(5);
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(userId, semesterId))
                .thenReturn(Optional.of(eligible));

        OjtStatusResponse response = service.getOjtStatusForCurrentUser("student@fpt.edu.vn");

        assertEquals(OjtStatus.PREPARING, response.ojtStatus());
        assertEquals("ĐANG CHUẨN BỊ OJT", response.statusLabel());
    }

    @Test
    void getOjtStatus_Semester6_NotEligible_ReturnsEligibleNoPlacement() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeSemester));

        // First call returns an eligible with semester 6
        EligibleStudent currentSemEligible = new EligibleStudent();
        currentSemEligible.setCurrentSemester(6);
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(userId, semesterId))
                .thenReturn(Optional.of(currentSemEligible))
                .thenReturn(Optional.empty()); // Second call returns empty simulating not in OJT list

        OjtStatusResponse response = service.getOjtStatusForCurrentUser("student@fpt.edu.vn");

        assertEquals(OjtStatus.ELIGIBLE_NO_PLACEMENT, response.ojtStatus());
        assertTrue(response.riskReason().contains("chưa được xếp vào danh sách OJT"));
    }

    @Test
    void getOjtStatus_Cancelled_ReturnsBlocked() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeSemester));

        EligibleStudent eligible = new EligibleStudent();
        eligible.setCurrentSemester(6);
        eligible.setStatus("CANCELLED");
        eligible.setCancelledReason("Gian lận thi cử");
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(userId, semesterId))
                .thenReturn(Optional.of(eligible));

        OjtStatusResponse response = service.getOjtStatusForCurrentUser("student@fpt.edu.vn");

        assertEquals(OjtStatus.BLOCKED, response.ojtStatus());
        assertTrue(response.riskReason().contains("Gian lận thi cử"));
    }

    @Test
    void getOjtStatus_PlacedWithMissedReports_ReturnsAtRisk() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeSemester));

        EligibleStudent eligible = new EligibleStudent();
        eligible.setCurrentSemester(6);
        eligible.setStatus("ELIGIBLE");
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(userId, semesterId))
                .thenReturn(Optional.of(eligible));

        EnterpriseAssignment assignment = new EnterpriseAssignment();
        assignment.setAssignmentId(UUID.randomUUID());
        Enterprise enterprise = new Enterprise();
        enterprise.setCompanyName("FPT Software");
        assignment.setEnterprise(enterprise);
        when(enterpriseAssignmentRepository.findByStudent_UserIdAndSemester_Status(userId, "ACTIVE"))
                .thenReturn(Optional.of(assignment));

        WeeklyReport report = new WeeklyReport();
        report.setStatus("NOT_SUBMITTED");
        when(weeklyReportRepository.findByAssignment_AssignmentId(assignment.getAssignmentId()))
                .thenReturn(List.of(report));

        OjtStatusResponse response = service.getOjtStatusForCurrentUser("student@fpt.edu.vn");

        assertEquals(OjtStatus.AT_RISK, response.ojtStatus());
        assertTrue(response.riskReason().contains("Bạn đã miss 1 báo cáo"));
        assertEquals("FPT Software", response.placementEnterpriseName());
    }

    @Test
    void getOjtStatus_PlacedNormal_ReturnsPlaced() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeSemester));

        EligibleStudent eligible = new EligibleStudent();
        eligible.setCurrentSemester(6);
        eligible.setStatus("ELIGIBLE");
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(userId, semesterId))
                .thenReturn(Optional.of(eligible));

        EnterpriseAssignment assignment = new EnterpriseAssignment();
        assignment.setAssignmentId(UUID.randomUUID());
        Enterprise enterprise = new Enterprise();
        enterprise.setCompanyName("FPT Software");
        assignment.setEnterprise(enterprise);
        when(enterpriseAssignmentRepository.findByStudent_UserIdAndSemester_Status(userId, "ACTIVE"))
                .thenReturn(Optional.of(assignment));

        WeeklyReport report1 = new WeeklyReport();
        report1.setStatus("APPROVED");
        WeeklyReport report2 = new WeeklyReport();
        report2.setStatus("REJECTED"); // Only 1 rejected is not AT_RISK
        when(weeklyReportRepository.findByAssignment_AssignmentId(assignment.getAssignmentId()))
                .thenReturn(List.of(report1, report2));

        when(applicationRepository.countActiveApplications(userId)).thenReturn(2L);
        when(interviewRepository.findByApplication_Student_UserId(userId)).thenReturn(List.of(new Interview()));

        OjtStatusResponse response = service.getOjtStatusForCurrentUser("student@fpt.edu.vn");

        assertEquals(OjtStatus.PLACED, response.ojtStatus());
        assertEquals("OJT IN PROGRESS", response.statusLabel());
        assertEquals(2, response.applicationCount());
        assertEquals(1, response.interviewCount());
        assertEquals(2, response.reportCount()); // 1 approved, 1 rejected
    }

    @Test
    void getOjtStatus_NotPlacedHasApplications_ReturnsApplied() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeSemester));

        EligibleStudent eligible = new EligibleStudent();
        eligible.setCurrentSemester(6);
        eligible.setStatus("ELIGIBLE");
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(userId, semesterId))
                .thenReturn(Optional.of(eligible));

        when(enterpriseAssignmentRepository.findByStudent_UserIdAndSemester_Status(userId, "ACTIVE"))
                .thenReturn(Optional.empty());

        Application app = new Application();
        app.setStatus(com.ueims.model.entity.ApplicationStatus.PENDING);
        when(applicationRepository.findByStudent_UserId(userId)).thenReturn(List.of(app));

        Interview interview = new Interview();
        interview.setStatus("SCHEDULED");
        when(interviewRepository.findByApplication_Student_UserId(userId)).thenReturn(List.of(interview));

        OjtStatusResponse response = service.getOjtStatusForCurrentUser("student@fpt.edu.vn");

        assertEquals(OjtStatus.APPLIED, response.ojtStatus());
        assertEquals("ĐÃ NỘP HỒ SƠ", response.statusLabel());
        assertEquals(1, response.applicationCount());
        assertEquals(1, response.interviewCount());
    }

    @Test
    void getOjtStatus_NotPlacedNoApplications_ReturnsEligibleNoPlacement() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeSemester));

        EligibleStudent eligible = new EligibleStudent();
        eligible.setCurrentSemester(6);
        eligible.setStatus("ELIGIBLE");
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(userId, semesterId))
                .thenReturn(Optional.of(eligible));

        when(enterpriseAssignmentRepository.findByStudent_UserIdAndSemester_Status(userId, "ACTIVE"))
                .thenReturn(Optional.empty());
        when(applicationRepository.findByStudent_UserId(userId)).thenReturn(List.of());

        OjtStatusResponse response = service.getOjtStatusForCurrentUser("student@fpt.edu.vn");

        assertEquals(OjtStatus.ELIGIBLE_NO_PLACEMENT, response.ojtStatus());
        assertTrue(response.riskReason().contains("chưa có chỗ thực tập"));
    }

    @Test
    void getOjtStatus_Exception_ReturnsDefault() {
        when(userRepository.findByEmail(anyString())).thenThrow(new RuntimeException("DB Error"));

        OjtStatusResponse response = service.getOjtStatusForCurrentUser("student@fpt.edu.vn");

        assertEquals(OjtStatus.NOT_APPLICABLE, response.ojtStatus());
    }
}
