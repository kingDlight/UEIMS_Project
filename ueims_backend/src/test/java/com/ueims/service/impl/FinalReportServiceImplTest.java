package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.FinalReport;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.FinalReportRepository;
import com.ueims.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class FinalReportServiceImplTest {

    @Mock
    private FinalReportRepository repository;

    @Mock
    private EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FinalReportServiceImpl service;

    private FinalReport report;
    private EnterpriseAssignment assignment;
    private User student;
    private UUID reportId;
    private UUID assignmentId;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        reportId = UUID.randomUUID();
        assignmentId = UUID.randomUUID();

        Semester semester = new Semester();
        semester.setEndDate(LocalDate.now().plusDays(30)); // Deadline not expired

        student = new User();
        student.setUserId(UUID.randomUUID());
        student.setEmail("student@test.com");
        student.setRoles(List.of()); // Non-staff

        assignment = new EnterpriseAssignment();
        assignment.setAssignmentId(assignmentId);
        assignment.setSemester(semester);
        assignment.setStudent(student);

        report = new FinalReport();
        report.setFinalReportId(reportId);
        report.setAssignment(assignment);
    }

    private void mockSecurityContext(User user) {
        Authentication auth = new UsernamePasswordAuthenticationToken(user.getEmail(), null);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    @Test
    void findAll_returnsList() {
        when(repository.findAll()).thenReturn(List.of(report));
        List<FinalReport> result = service.findAll();
        assertEquals(1, result.size());
    }

    @Test
    void findById_exists_returnsFinalReport() {
        when(repository.findById(reportId)).thenReturn(Optional.of(report));
        FinalReport result = service.findById(reportId);
        assertNotNull(result);
        assertEquals(reportId, result.getFinalReportId());
    }

    @Test
    void findById_notExists_returnsNull() {
        when(repository.findById(any())).thenReturn(Optional.empty());
        FinalReport result = service.findById(UUID.randomUUID());
        assertNull(result);
    }

    @Test
    void save_returnsSavedReport() {
        when(repository.save(report)).thenReturn(report);
        FinalReport result = service.save(report);
        assertNotNull(result);
    }

    @Test
    void deleteById_success() {
        service.deleteById(reportId);
        verify(repository).deleteById(reportId);
    }

    @Test
    void uploadFinalReport_nullFile_throwsException() {
        AppException e = assertThrows(AppException.class, () -> service.uploadFinalReport(assignmentId, null));
        assertEquals(ErrorCode.FIELD_REQUIRED, e.getErrorCode());
    }

    @Test
    void uploadFinalReport_invalidFormat_throwsException() {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "content".getBytes());
        AppException e = assertThrows(AppException.class, () -> service.uploadFinalReport(assignmentId, file));
        assertEquals(ErrorCode.FINAL_REPORT_INVALID_FORMAT, e.getErrorCode());
    }

    @Test
    void uploadFinalReport_sizeExceeded_throwsException() {
        byte[] largeContent = new byte[6 * 1024 * 1024]; // 6MB
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", largeContent);

        AppException e = assertThrows(AppException.class, () -> service.uploadFinalReport(assignmentId, file));
        assertEquals(ErrorCode.FINAL_REPORT_SIZE_EXCEEDED, e.getErrorCode());
    }

    @Test
    void uploadFinalReport_assignmentNotFound_throwsException() {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());
        when(enterpriseAssignmentRepository.findById(assignmentId)).thenReturn(Optional.empty());

        AppException e = assertThrows(AppException.class, () -> service.uploadFinalReport(assignmentId, file));
        assertEquals(ErrorCode.FIELD_REQUIRED, e.getErrorCode());
    }

    @Test
    void uploadFinalReport_deadlineExpired_throwsException() {
        assignment.getSemester().setEndDate(LocalDate.now().minusDays(1)); // Expired
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());

        when(enterpriseAssignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

        AppException e = assertThrows(AppException.class, () -> service.uploadFinalReport(assignmentId, file));
        assertEquals(ErrorCode.FINAL_REPORT_DEADLINE_EXPIRED, e.getErrorCode());
    }

    @Test
    void uploadFinalReport_success() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());

        when(enterpriseAssignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(repository.findByAssignment_AssignmentId(assignmentId)).thenReturn(Optional.empty());
        when(repository.save(any(FinalReport.class))).thenAnswer(i -> i.getArgument(0));

        FinalReport result = service.uploadFinalReport(assignmentId, file);

        assertNotNull(result);
        assertEquals(assignment, result.getAssignment());
        assertTrue(result.getFileUrl().contains("test.pdf"));

        // Clean up
        Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "final-reports");
        String filename = result.getFileUrl().substring(result.getFileUrl().lastIndexOf("/") + 1);
        Files.deleteIfExists(uploadDir.resolve(filename));
    }
}
