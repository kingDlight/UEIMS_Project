package com.ueims.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.dto.dashboard.ChartDataDTO;
import com.ueims.model.entity.SemesterStatistics;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.FinalGradeRepository;
import com.ueims.repository.SemesterStatisticsRepository;
import com.ueims.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final SemesterStatisticsRepository semesterStatisticsRepository;
    private final EligibleStudentRepository eligibleStudentRepository;
    private final FinalGradeRepository finalGradeRepository;

    @Override
    public List<ChartDataDTO> getEmploymentRateChart(UUID semesterId) {
        SemesterStatistics stats = semesterStatisticsRepository
                .findById(semesterId)
                .orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));
        List<ChartDataDTO> chart = new ArrayList<>();

        long ojt = stats.getTotalOjt() != null ? stats.getTotalOjt() : 0;
        long total = stats.getTotalEligible() != null ? stats.getTotalEligible() : 0;
        long withoutOjt = total - ojt;
        if (withoutOjt < 0) withoutOjt = 0;

        chart.add(new ChartDataDTO("OJT Students", ojt));
        chart.add(new ChartDataDTO("Non-OJT", withoutOjt));
        return chart;
    }

    @Override
    public List<ChartDataDTO> getInterviewPassRateChart(UUID semesterId) {
        SemesterStatistics stats = semesterStatisticsRepository
                .findById(semesterId)
                .orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));
        List<ChartDataDTO> chart = new ArrayList<>();

        long passed = stats.getInterviewsPassed() != null ? stats.getInterviewsPassed() : 0;
        long failed = stats.getInterviewsFailed() != null ? stats.getInterviewsFailed() : 0;

        chart.add(new ChartDataDTO("Passed", passed));
        chart.add(new ChartDataDTO("Failed", failed));
        return chart;
    }

    @Override
    public List<ChartDataDTO> getMajorDistributionChart(UUID semesterId) {
        return eligibleStudentRepository.countStudentsByMajor(semesterId);
    }

    @Override
    public List<ChartDataDTO> getGradeDistributionChart(UUID semesterId) {
        List<BigDecimal> grades = finalGradeRepository.findAllGradeValuesBySemesterId(semesterId);
        int excellent = 0; // 8.5 - 10
        int good = 0; // 7.0 - 8.4
        int average = 0; // 5.0 - 6.9
        int failed = 0; // < 5.0

        for (BigDecimal g : grades) {
            if (g == null) continue;
            double value = g.doubleValue();
            if (value >= 8.5) {
                excellent++;
            } else if (value >= 7.0) {
                good++;
            } else if (value >= 5.0) {
                average++;
            } else {
                failed++;
            }
        }

        List<ChartDataDTO> chart = new ArrayList<>();
        chart.add(new ChartDataDTO("Excellent (8.5 - 10)", excellent));
        chart.add(new ChartDataDTO("Good (7.0 - 8.4)", good));
        chart.add(new ChartDataDTO("Average (5.0 - 6.9)", average));
        chart.add(new ChartDataDTO("Failed (< 5.0)", failed));
        return chart;
    }

    @Override
    public List<ChartDataDTO> getAverageRatingChart(UUID semesterId) {
        SemesterStatistics stats = semesterStatisticsRepository
                .findById(semesterId)
                .orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));
        List<ChartDataDTO> chart = new ArrayList<>();
        BigDecimal avgFinalGrade = stats.getAvgFinalGrade() != null ? stats.getAvgFinalGrade() : BigDecimal.ZERO;
        chart.add(new ChartDataDTO("Average Rating", avgFinalGrade.doubleValue()));
        return chart;
    }
}
