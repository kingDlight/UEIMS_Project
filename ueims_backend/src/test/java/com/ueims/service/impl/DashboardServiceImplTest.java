package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.dto.dashboard.ChartDataDTO;
import com.ueims.model.dto.dashboard.CommandCenterSummaryDTO;
import com.ueims.model.entity.*;
import com.ueims.repository.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock
    private SemesterStatisticsRepository semesterStatisticsRepository;

    @Mock
    private EligibleStudentRepository eligibleStudentRepository;

    @Mock
    private FinalGradeRepository finalGradeRepository;

    @Mock
    private EnterpriseRepository enterpriseRepository;

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private WeeklyReportRepository weeklyReportRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @Mock
    private JobPostRepository jobPostRepository;

    @InjectMocks
    private DashboardServiceImpl service;

    private UUID semesterId;
    private SemesterStatistics stats;

    @BeforeEach
    void setUp() {
        semesterId = UUID.randomUUID();
        stats = new SemesterStatistics();
        stats.setSemesterId(semesterId);
        stats.setTotalEligible(100L);
        stats.setTotalOjt(80L);
        stats.setInterviewsPassed(60L);
        stats.setInterviewsFailed(40L);
        stats.setAvgFinalGrade(new BigDecimal("8.5"));
    }

    @Test
    void getCommandCenterSummary_ReturnsCorrectData() {
        // Mock Pending Enterprise
        Enterprise e1 = new Enterprise();
        e1.setEnterpriseId(UUID.randomUUID());
        e1.setCompanyName("Pending Ent");
        e1.setStatus("PENDING");
        e1.setCreatedAt(LocalDateTime.now().minusDays(3));

        Enterprise e2 = new Enterprise();
        e2.setStatus("APPROVED");

        when(enterpriseRepository.findAll()).thenReturn(List.of(e1, e2));

        // Mock Incidents
        Incident i1 = new Incident();
        i1.setIncidentId(UUID.randomUUID());
        i1.setStatus("OPEN");
        i1.setCategory("Behavior");
        i1.setCreatedAt(LocalDateTime.now().minusDays(1));

        User student = new User();
        student.setUserId(UUID.randomUUID());
        student.setFullName("John Doe");
        i1.setReportedBy(student);

        EnterpriseAssignment assignment = new EnterpriseAssignment();
        Enterprise ent = new Enterprise();
        ent.setCompanyName("Assigned Ent");
        assignment.setEnterprise(ent);
        i1.setAssignment(assignment);

        when(incidentRepository.findAll()).thenReturn(List.of(i1));

        // Mock Weekly Reports
        WeeklyReport r1 = new WeeklyReport();
        r1.setStatus("SUBMITTED");

        WeeklyReport r2 = new WeeklyReport();
        r2.setStatus("DRAFT");

        WeeklyReport r3 = new WeeklyReport();
        r3.setStatus("LATE");
        r3.setCreatedAt(LocalDateTime.now().minusDays(10));
        EnterpriseAssignment a3 = new EnterpriseAssignment();
        User s3 = new User();
        s3.setFullName("Late Student");
        a3.setStudent(s3);
        r3.setAssignment(a3);

        WeeklyReport r4 = new WeeklyReport();
        r4.setStatus("NOT_STARTED"); // fall through to notStarted

        when(weeklyReportRepository.findAll()).thenReturn(List.of(r1, r2, r3, r4));

        // Mock Pipeline
        when(eligibleStudentRepository.count()).thenReturn(100L);
        when(applicationRepository.count()).thenReturn(200L);
        when(interviewRepository.count()).thenReturn(150L);
        when(enterpriseAssignmentRepository.count()).thenReturn(80L);

        // Mock KPIs
        when(userRepository.count()).thenReturn(500L);
        when(userRoleRepository.countByRoleName("STUDENT")).thenReturn(400L);
        when(enterpriseRepository.count()).thenReturn(50L);
        when(userRoleRepository.countByRoleName("TRAINING_MANAGER")).thenReturn(10L);
        when(userRoleRepository.countByRoleName("ADMIN")).thenReturn(5L);
        when(jobPostRepository.count()).thenReturn(300L);
        when(enterpriseAssignmentRepository.countByStatus("ACTIVE")).thenReturn(75L);

        CommandCenterSummaryDTO summary = service.getCommandCenterSummary();

        assertNotNull(summary);
        assertEquals(1, summary.getTotalPendingEnterprises());
        assertEquals("Pending Ent", summary.getPendingEnterprises().get(0).getName());
        assertTrue(summary.getPendingEnterprises().get(0).getDaysWaiting() >= 2);

        assertEquals(1, summary.getTotalActiveIncidents());
        assertEquals("John Doe", summary.getActiveIncidents().get(0).getName());
        assertEquals("Assigned Ent", summary.getActiveIncidents().get(0).getEnterprise());

        assertEquals(1, summary.getWeeklyReports().getSubmitted());
        assertEquals(1, summary.getWeeklyReports().getPending());
        assertEquals(1, summary.getWeeklyReports().getLate());
        assertEquals(1, summary.getWeeklyReports().getNotStarted());
        assertEquals(
                "Late Student", summary.getWeeklyReports().getStudents().get(0).getName());

        assertEquals(100, summary.getPipeline().getEligible());
        assertEquals(200, summary.getPipeline().getApplied());
        assertEquals(150, summary.getPipeline().getInterviewed());
        assertEquals(80, summary.getPipeline().getPlaced());

        assertEquals(500L, summary.getTotalUsers());
        assertEquals(400L, summary.getTotalStudents());
        assertEquals(50L, summary.getTotalEnterprises());
        assertEquals(75L, summary.getActiveInternships());
    }

    @Test
    void getEmploymentRateChart_success_withData() {
        when(semesterStatisticsRepository.findById(semesterId)).thenReturn(Optional.of(stats));

        List<ChartDataDTO> result = service.getEmploymentRateChart(semesterId);

        assertEquals(2, result.size());
        assertEquals("OJT Students", result.get(0).getLabel());
        assertEquals(80L, ((Number) result.get(0).getValue()).longValue());
        assertEquals("Non-OJT", result.get(1).getLabel());
        assertEquals(20L, ((Number) result.get(1).getValue()).longValue());
    }

    @Test
    void getEmploymentRateChart_success_withNulls() {
        stats.setTotalEligible(null);
        stats.setTotalOjt(null);
        when(semesterStatisticsRepository.findById(semesterId)).thenReturn(Optional.of(stats));

        List<ChartDataDTO> result = service.getEmploymentRateChart(semesterId);

        assertEquals(2, result.size());
        assertEquals("OJT Students", result.get(0).getLabel());
        assertEquals(0L, ((Number) result.get(0).getValue()).longValue());
        assertEquals("Non-OJT", result.get(1).getLabel());
        assertEquals(0L, ((Number) result.get(1).getValue()).longValue());
    }

    @Test
    void getEmploymentRateChart_semesterNotFound_throwsException() {
        when(semesterStatisticsRepository.findById(any())).thenReturn(Optional.empty());

        UUID id = UUID.randomUUID();
        AppException e = assertThrows(AppException.class, () -> service.getEmploymentRateChart(id));
        assertEquals(ErrorCode.SEMESTER_NOT_FOUND, e.getErrorCode());
    }

    @Test
    void getInterviewPassRateChart_success_withData() {
        when(semesterStatisticsRepository.findById(semesterId)).thenReturn(Optional.of(stats));

        List<ChartDataDTO> result = service.getInterviewPassRateChart(semesterId);

        assertEquals(2, result.size());
        assertEquals("Passed", result.get(0).getLabel());
        assertEquals(60L, ((Number) result.get(0).getValue()).longValue());
        assertEquals("Failed", result.get(1).getLabel());
        assertEquals(40L, ((Number) result.get(1).getValue()).longValue());
    }

    @Test
    void getInterviewPassRateChart_success_withNulls() {
        stats.setInterviewsPassed(null);
        stats.setInterviewsFailed(null);
        when(semesterStatisticsRepository.findById(semesterId)).thenReturn(Optional.of(stats));

        List<ChartDataDTO> result = service.getInterviewPassRateChart(semesterId);

        assertEquals(2, result.size());
        assertEquals(0L, ((Number) result.get(0).getValue()).longValue());
        assertEquals(0L, ((Number) result.get(1).getValue()).longValue());
    }

    @Test
    void getInterviewPassRateChart_semesterNotFound_throwsException() {
        when(semesterStatisticsRepository.findById(any())).thenReturn(Optional.empty());

        UUID id = UUID.randomUUID();
        AppException e = assertThrows(AppException.class, () -> service.getInterviewPassRateChart(id));
        assertEquals(ErrorCode.SEMESTER_NOT_FOUND, e.getErrorCode());
    }

    @Test
    void getMajorDistributionChart_success() {
        List<ChartDataDTO> mockData = Arrays.asList(new ChartDataDTO("IT", 50), new ChartDataDTO("Business", 30));
        when(eligibleStudentRepository.countStudentsByMajor(semesterId)).thenReturn(mockData);

        List<ChartDataDTO> result = service.getMajorDistributionChart(semesterId);

        assertEquals(2, result.size());
        assertEquals("IT", result.get(0).getLabel());
        assertEquals(50, ((Number) result.get(0).getValue()).intValue());
    }

    @Test
    void getGradeDistributionChart_success() {
        List<BigDecimal> grades = Arrays.asList(
                new BigDecimal("9.0"), // Excellent
                new BigDecimal("8.5"), // Excellent
                new BigDecimal("7.5"), // Good
                new BigDecimal("6.0"), // Average
                new BigDecimal("4.0"), // Failed
                null // Should be ignored
                );
        when(finalGradeRepository.findAllGradeValuesBySemesterId(semesterId)).thenReturn(grades);

        List<ChartDataDTO> result = service.getGradeDistributionChart(semesterId);

        assertEquals(4, result.size());
        assertEquals("Excellent (8.5 - 10)", result.get(0).getLabel());
        assertEquals(2, ((Number) result.get(0).getValue()).intValue());

        assertEquals("Good (7.0 - 8.4)", result.get(1).getLabel());
        assertEquals(1, ((Number) result.get(1).getValue()).intValue());

        assertEquals("Average (5.0 - 6.9)", result.get(2).getLabel());
        assertEquals(1, ((Number) result.get(2).getValue()).intValue());

        assertEquals("Failed (< 5.0)", result.get(3).getLabel());
        assertEquals(1, ((Number) result.get(3).getValue()).intValue());
    }

    @Test
    void getAverageRatingChart_success_withData() {
        when(semesterStatisticsRepository.findById(semesterId)).thenReturn(Optional.of(stats));

        List<ChartDataDTO> result = service.getAverageRatingChart(semesterId);

        assertEquals(1, result.size());
        assertEquals("Average Rating", result.get(0).getLabel());
        assertEquals(8.5, ((Number) result.get(0).getValue()).doubleValue(), 0.001);
    }

    @Test
    void getAverageRatingChart_success_withNulls() {
        stats.setAvgFinalGrade(null);
        when(semesterStatisticsRepository.findById(semesterId)).thenReturn(Optional.of(stats));

        List<ChartDataDTO> result = service.getAverageRatingChart(semesterId);

        assertEquals(1, result.size());
        assertEquals(0.0, ((Number) result.get(0).getValue()).doubleValue(), 0.001);
    }

    @Test
    void getAverageRatingChart_semesterNotFound_throwsException() {
        when(semesterStatisticsRepository.findById(any())).thenReturn(Optional.empty());

        UUID id = UUID.randomUUID();
        AppException e = assertThrows(AppException.class, () -> service.getAverageRatingChart(id));
        assertEquals(ErrorCode.SEMESTER_NOT_FOUND, e.getErrorCode());
    }
}
