package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
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
import com.ueims.model.entity.SemesterStatistics;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.FinalGradeRepository;
import com.ueims.repository.SemesterStatisticsRepository;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock
    private SemesterStatisticsRepository semesterStatisticsRepository;

    @Mock
    private EligibleStudentRepository eligibleStudentRepository;

    @Mock
    private FinalGradeRepository finalGradeRepository;

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
    void getEmploymentRateChart_success_withData() {
        when(semesterStatisticsRepository.findById(semesterId)).thenReturn(Optional.of(stats));

        List<ChartDataDTO> result = service.getEmploymentRateChart(semesterId);

        assertEquals(2, result.size());
        assertEquals("OJT Students", result.get(0).getLabel());
        assertEquals(80L, result.get(0).getValue());
        assertEquals("Non-OJT", result.get(1).getLabel());
        assertEquals(20L, result.get(1).getValue());
    }

    @Test
    void getEmploymentRateChart_success_withNulls() {
        stats.setTotalEligible(null);
        stats.setTotalOjt(null);
        when(semesterStatisticsRepository.findById(semesterId)).thenReturn(Optional.of(stats));

        List<ChartDataDTO> result = service.getEmploymentRateChart(semesterId);

        assertEquals(2, result.size());
        assertEquals("OJT Students", result.get(0).getLabel());
        assertEquals(0L, result.get(0).getValue());
        assertEquals("Non-OJT", result.get(1).getLabel());
        assertEquals(0L, result.get(1).getValue());
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
        assertEquals(60L, result.get(0).getValue());
        assertEquals("Failed", result.get(1).getLabel());
        assertEquals(40L, result.get(1).getValue());
    }

    @Test
    void getInterviewPassRateChart_success_withNulls() {
        stats.setInterviewsPassed(null);
        stats.setInterviewsFailed(null);
        when(semesterStatisticsRepository.findById(semesterId)).thenReturn(Optional.of(stats));

        List<ChartDataDTO> result = service.getInterviewPassRateChart(semesterId);

        assertEquals(2, result.size());
        assertEquals(0L, result.get(0).getValue());
        assertEquals(0L, result.get(1).getValue());
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
        assertEquals(50, result.get(0).getValue());
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
        assertEquals(2, result.get(0).getValue());

        assertEquals("Good (7.0 - 8.4)", result.get(1).getLabel());
        assertEquals(1, result.get(1).getValue());

        assertEquals("Average (5.0 - 6.9)", result.get(2).getLabel());
        assertEquals(1, result.get(2).getValue());

        assertEquals("Failed (< 5.0)", result.get(3).getLabel());
        assertEquals(1, result.get(3).getValue());
    }

    @Test
    void getAverageRatingChart_success_withData() {
        when(semesterStatisticsRepository.findById(semesterId)).thenReturn(Optional.of(stats));

        List<ChartDataDTO> result = service.getAverageRatingChart(semesterId);

        assertEquals(1, result.size());
        assertEquals("Average Rating", result.get(0).getLabel());
        assertEquals(8.5, result.get(0).getValue());
    }

    @Test
    void getAverageRatingChart_success_withNulls() {
        stats.setAvgFinalGrade(null);
        when(semesterStatisticsRepository.findById(semesterId)).thenReturn(Optional.of(stats));

        List<ChartDataDTO> result = service.getAverageRatingChart(semesterId);

        assertEquals(1, result.size());
        assertEquals(0.0, result.get(0).getValue());
    }

    @Test
    void getAverageRatingChart_semesterNotFound_throwsException() {
        when(semesterStatisticsRepository.findById(any())).thenReturn(Optional.empty());

        UUID id = UUID.randomUUID();
        AppException e = assertThrows(AppException.class, () -> service.getAverageRatingChart(id));
        assertEquals(ErrorCode.SEMESTER_NOT_FOUND, e.getErrorCode());
    }
}
