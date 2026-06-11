package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
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

import com.ueims.dto.request.WeeklyReportRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.WeeklyReportRepository;

@ExtendWith(MockitoExtension.class)
class WeeklyReportServiceImplTest {

    @Mock
    private WeeklyReportRepository repository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EligibleStudentRepository eligibleStudentRepository;

    @Mock
    private EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    @InjectMocks
    private WeeklyReportServiceImpl service;

    private User currentUser;
    private Semester semester;
    private EnterpriseAssignment assignment;
    private WeeklyReport report;
    private UUID reportId;
    private EligibleStudent eligibleStudent;

    @BeforeEach
    void setUp() {
        currentUser = new User();
        currentUser.setUserId(UUID.randomUUID());
        currentUser.setEmail("student@test.com");

        semester = new Semester();
        semester.setSemesterId(UUID.randomUUID());
        semester.setStartDate(LocalDate.now().minusWeeks(2)); // Current week is 3

        assignment = new EnterpriseAssignment();
        assignment.setAssignmentId(UUID.randomUUID());
        assignment.setStudent(currentUser);
        assignment.setSemester(semester);

        eligibleStudent = new EligibleStudent();
        eligibleStudent.setEligibleId(UUID.randomUUID());
        eligibleStudent.setUser(currentUser);
        eligibleStudent.setSemester(semester);

        reportId = UUID.randomUUID();
        report = new WeeklyReport();
        report.setReportId(reportId);
        report.setAssignment(assignment);
        report.setWeekNumber(3);
        report.setStatus("DRAFT");
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
        when(repository.findAll()).thenReturn(List.of(report));
        List<WeeklyReport> result = service.findAll();
        assertEquals(1, result.size());
    }

    @Test
    void findMyReports_success() {
        mockSecurityContext(currentUser);
        when(repository.findByAssignment_Student_UserId(currentUser.getUserId()))
                .thenReturn(List.of(report));

        List<WeeklyReport> result = service.findMyReports();

        assertEquals(1, result.size());
    }

    @Test
    void findById_exists_returnsReport() {
        when(repository.findById(reportId)).thenReturn(Optional.of(report));
        WeeklyReport result = service.findById(reportId);
        assertNotNull(result);
        assertEquals(reportId, result.getReportId());
    }

    @Test
    void findById_notExists_returnsNull() {
        when(repository.findById(any())).thenReturn(Optional.empty());
        WeeklyReport result = service.findById(UUID.randomUUID());
        assertNull(result);
    }

    @Test
    void save_success() {
        mockSecurityContext(currentUser);

        when(enterpriseAssignmentRepository.findById(assignment.getAssignmentId()))
                .thenReturn(Optional.of(assignment));
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(eligibleStudent));
        when(repository.save(any(WeeklyReport.class))).thenAnswer(i -> i.getArgument(0));

        WeeklyReport newReport = new WeeklyReport();
        EnterpriseAssignment reqAssignment = new EnterpriseAssignment();
        reqAssignment.setAssignmentId(assignment.getAssignmentId());
        newReport.setAssignment(reqAssignment);

        // Calculate current week to pass the BR-52 check
        long currentWeek = ChronoUnit.WEEKS.between(semester.getStartDate(), LocalDate.now()) + 1;
        newReport.setWeekNumber((int) currentWeek);

        WeeklyReport result = service.save(newReport);

        assertNotNull(result);
        assertEquals((int) currentWeek, result.getWeekNumber());
    }

    @Test
    void save_assignmentNotFound_throwsException() {
        mockSecurityContext(currentUser);

        WeeklyReport newReport = new WeeklyReport();
        EnterpriseAssignment reqAssignment = new EnterpriseAssignment();
        reqAssignment.setAssignmentId(UUID.randomUUID());
        newReport.setAssignment(reqAssignment);

        when(enterpriseAssignmentRepository.findById(any())).thenReturn(Optional.empty());

        AppException e = assertThrows(AppException.class, () -> service.save(newReport));
        assertEquals(ErrorCode.FIELD_REQUIRED, e.getErrorCode());
    }

    @Test
    void save_unauthorized_notStudent_throwsException() {
        mockSecurityContext(currentUser);

        User otherStudent = new User();
        otherStudent.setUserId(UUID.randomUUID());
        assignment.setStudent(otherStudent);

        when(enterpriseAssignmentRepository.findById(assignment.getAssignmentId()))
                .thenReturn(Optional.of(assignment));

        WeeklyReport newReport = new WeeklyReport();
        newReport.setAssignment(assignment);

        AppException e = assertThrows(AppException.class, () -> service.save(newReport));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void save_studentNotEligible_throwsException() {
        mockSecurityContext(currentUser);

        when(enterpriseAssignmentRepository.findById(assignment.getAssignmentId()))
                .thenReturn(Optional.of(assignment));
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(any(), any()))
                .thenReturn(Optional.empty());

        WeeklyReport newReport = new WeeklyReport();
        newReport.setAssignment(assignment);

        AppException e = assertThrows(AppException.class, () -> service.save(newReport));
        assertEquals(ErrorCode.STUDENT_NOT_ELIGIBLE, e.getErrorCode());
    }

    @Test
    void save_weekNumberMismatch_throwsException() {
        mockSecurityContext(currentUser);

        when(enterpriseAssignmentRepository.findById(assignment.getAssignmentId()))
                .thenReturn(Optional.of(assignment));
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(eligibleStudent));

        WeeklyReport newReport = new WeeklyReport();
        newReport.setAssignment(assignment);
        newReport.setWeekNumber(99); // Invalid week

        AppException e = assertThrows(AppException.class, () -> service.save(newReport));
        assertEquals(ErrorCode.APPLICATION_DEADLINE_EXPIRED, e.getErrorCode());
    }

    @Test
    void updateReport_success() {
        mockSecurityContext(currentUser);

        when(repository.findById(reportId)).thenReturn(Optional.of(report));
        when(repository.save(any(WeeklyReport.class))).thenAnswer(i -> i.getArgument(0));

        WeeklyReportRequest request = new WeeklyReportRequest();
        request.setTasksCompleted("Tasks <script>alert(1)</script>");
        request.setStatus("SUBMITTED");

        WeeklyReport result = service.updateReport(reportId, request);

        assertNotNull(result);
        assertEquals("SUBMITTED", result.getStatus());
        assertFalse(result.getTasksCompleted().contains("<script>"));
    }

    @Test
    void updateReport_reportNotFound_throwsException() {
        when(repository.findById(any())).thenReturn(Optional.empty());
        WeeklyReportRequest request = new WeeklyReportRequest();

        AppException e = assertThrows(AppException.class, () -> service.updateReport(reportId, request));
        assertEquals(ErrorCode.FIELD_REQUIRED, e.getErrorCode());
    }

    @Test
    void updateReport_unauthorized_notOwner_throwsException() {
        User otherUser = new User();
        otherUser.setUserId(UUID.randomUUID());
        otherUser.setEmail("other@test.com");
        mockSecurityContext(otherUser);

        when(repository.findById(reportId)).thenReturn(Optional.of(report));

        WeeklyReportRequest request = new WeeklyReportRequest();

        AppException e = assertThrows(AppException.class, () -> service.updateReport(reportId, request));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void updateReport_statusNotAllowed_throwsException() {
        mockSecurityContext(currentUser);

        report.setStatus("APPROVED");
        when(repository.findById(reportId)).thenReturn(Optional.of(report));

        WeeklyReportRequest request = new WeeklyReportRequest();

        AppException e = assertThrows(AppException.class, () -> service.updateReport(reportId, request));
        assertEquals(ErrorCode.APPLICATION_STATUS_CHANGED, e.getErrorCode());
    }

    @Test
    void deleteById_success() {
        service.deleteById(reportId);
        verify(repository).deleteById(reportId);
    }
}
