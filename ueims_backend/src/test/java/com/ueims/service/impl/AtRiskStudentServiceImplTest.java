package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
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
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.model.entity.AtRiskStudent;
import com.ueims.model.entity.Semester;
import com.ueims.repository.AtRiskStudentRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.service.TrainingWarningService;

@ExtendWith(MockitoExtension.class)
class AtRiskStudentServiceImplTest {

    @Mock
    private AtRiskStudentRepository atRiskStudentRepository;

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private TrainingWarningService trainingWarningService;

    @InjectMocks
    private AtRiskStudentServiceImpl service;

    private UUID semesterId;
    private Semester semester;

    @BeforeEach
    void setUp() {
        semesterId = UUID.randomUUID();
        semester = new Semester();
        semester.setSemesterId(semesterId);
        semester.setSemesterCode("FA24");
        semester.setStartDate(LocalDate.now().minusDays(15));
        semester.setEndDate(LocalDate.now().plusDays(60));
        semester.setStatus("ACTIVE");
    }

    @Test
    void getAtRiskStudentsBySemester_returnsList() {
        AtRiskStudent student = new AtRiskStudent();
        when(atRiskStudentRepository.findBySemesterId(semesterId)).thenReturn(List.of(student));

        List<AtRiskStudent> result = service.getAtRiskStudentsBySemester(semesterId);

        assertEquals(1, result.size());
        verify(atRiskStudentRepository).findBySemesterId(semesterId);
    }

    @Test
    void scanAndProcessLateReportsAutomatically_noActiveSemesters_doesNothing() {
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(Collections.emptyList());

        service.scanAndProcessLateReportsAutomatically();

        verify(trainingWarningService, never()).scanAndSendLateWarnings(any(), anyInt(), any());
    }

    @Test
    void scanAndProcessLateReportsAutomatically_outsideActivePeriod_skipsSemester() {
        // Yesterday is before start date
        semester.setStartDate(LocalDate.now().plusDays(5));
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(semester));

        service.scanAndProcessLateReportsAutomatically();

        verify(trainingWarningService, never()).scanAndSendLateWarnings(any(), anyInt(), any());

        // Yesterday is after end date
        semester.setStartDate(LocalDate.now().minusDays(100));
        semester.setEndDate(LocalDate.now().minusDays(10));

        service.scanAndProcessLateReportsAutomatically();

        verify(trainingWarningService, never()).scanAndSendLateWarnings(any(), anyInt(), any());
    }

    @Test
    void scanAndProcessLateReportsAutomatically_withinActivePeriod_processesWarnings() {
        when(semesterRepository.findByStatus("ACTIVE")).thenReturn(List.of(semester));
        when(trainingWarningService.scanAndSendLateWarnings(eq(semesterId), anyInt(), isNull()))
                .thenReturn(5);

        service.scanAndProcessLateReportsAutomatically();

        verify(trainingWarningService).scanAndSendLateWarnings(eq(semesterId), anyInt(), isNull());
    }
}
