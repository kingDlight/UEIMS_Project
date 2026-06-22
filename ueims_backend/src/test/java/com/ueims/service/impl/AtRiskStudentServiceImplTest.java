package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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

import com.ueims.model.entity.Semester;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.WeeklyReportRepository;
import com.ueims.service.TrainingWarningService;

@ExtendWith(MockitoExtension.class)
class AtRiskStudentServiceImplTest {

    @Mock
    private EligibleStudentRepository eligibleStudentRepository;

    @Mock
    private EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private WeeklyReportRepository weeklyReportRepository;

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
    void getAtRiskStudentsBySemester_returnsEmptyList() {
        when(semesterRepository.findById(semesterId)).thenReturn(java.util.Optional.of(semester));
        when(eligibleStudentRepository.findBySemester_SemesterIdAndStatusIn(any(), any()))
                .thenReturn(Collections.emptyList());
        when(enterpriseAssignmentRepository.findBySemester_SemesterIdAndStatus(any(), any()))
                .thenReturn(Collections.emptyList());
        when(eligibleStudentRepository.findBySemester_SemesterIdAndStatus(any(), any()))
                .thenReturn(Collections.emptyList());

        List<AtRiskStudentResult> result = service.getAtRiskStudentsBySemester(semesterId);

        assertTrue(result.isEmpty());
        verify(semesterRepository).findById(semesterId);
    }
}
