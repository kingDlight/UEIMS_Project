package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.dto.response.MissingReportDto;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.util.WeekCalculator;

@ExtendWith(MockitoExtension.class)
class ScanMissingReportsServiceTest {

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private EnterpriseAssignmentRepository assignmentRepository;

    @InjectMocks
    private ScanMissingReportsService service;

    private Semester activeSemester;
    private EnterpriseAssignment assignment;
    private UUID semesterId;

    @BeforeEach
    void setUp() {
        semesterId = UUID.randomUUID();

        activeSemester = new Semester();
        activeSemester.setSemesterId(semesterId);
        activeSemester.setSemesterCode("FA24");
        activeSemester.setStartDate(LocalDate.now().minusDays(20)); // Week 3
        activeSemester.setEndDate(LocalDate.now().plusDays(40));
        activeSemester.setStatus("ACTIVE");

        User student = new User();
        student.setUserId(UUID.randomUUID());
        student.setFullName("Le Thi B");

        Enterprise enterprise = new Enterprise();
        enterprise.setCompanyName("Tech Company");

        assignment = new EnterpriseAssignment();
        assignment.setAssignmentId(UUID.randomUUID());
        assignment.setStudent(student);
        assignment.setEnterprise(enterprise);
    }

    @Test
    void scanMissingReports_noActiveSemester_returnsEmptyList() {
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(Collections.emptyList());

        List<MissingReportDto> result = service.scanMissingReports();

        assertTrue(result.isEmpty());
        verify(assignmentRepository, never()).findAssignmentsWithLateReports(any(), anyInt());
    }

    @Test
    void scanMissingReports_semesterNotStarted_skipsSemester() {
        activeSemester.setStartDate(LocalDate.now().plusDays(5));
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeSemester));

        // It should be skipped due to not started (currentWeek < 1 in logic or filtered out)
        List<MissingReportDto> result = service.scanMissingReports();

        assertTrue(result.isEmpty());
        verify(assignmentRepository, never()).findAssignmentsWithLateReports(any(), anyInt());
    }

    @Test
    void scanMissingReports_hasActiveSemester_returnsMissingReports() {
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeSemester));

        try (MockedStatic<WeekCalculator> mockedCalculator = mockStatic(WeekCalculator.class)) {
            mockedCalculator
                    .when(() -> WeekCalculator.getCurrentWeek(any(LocalDate.class)))
                    .thenReturn(3);

            when(assignmentRepository.findAssignmentsWithLateReports(semesterId, 3))
                    .thenReturn(List.of(assignment));

            List<MissingReportDto> result = service.scanMissingReports();

            assertEquals(1, result.size());
            assertEquals(assignment.getAssignmentId(), result.get(0).getAssignmentId());
            assertEquals(semesterId, result.get(0).getSemesterId());
            assertEquals(3, result.get(0).getWeekNumber());
        }
    }

    @Test
    void getMissingReportsForWeek_returnsMissingReports() {
        when(assignmentRepository.findAssignmentsWithLateReports(semesterId, 2)).thenReturn(List.of(assignment));

        List<MissingReportDto> result = service.getMissingReportsForWeek(semesterId, 2);

        assertEquals(1, result.size());
        assertEquals(assignment.getAssignmentId(), result.get(0).getAssignmentId());
        assertEquals(semesterId, result.get(0).getSemesterId());
        assertEquals(2, result.get(0).getWeekNumber());
    }
}
