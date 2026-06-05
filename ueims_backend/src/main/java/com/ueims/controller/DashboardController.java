package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.dto.dashboard.ChartDataDTO;
import com.ueims.model.entity.SemesterStatistics;
import com.ueims.repository.SemesterStatisticsRepository;
import com.ueims.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final SemesterStatisticsRepository semesterStatisticsRepository;
    private final DashboardService dashboardService;

    @GetMapping("/statistics")
    public ResponseEntity<List<SemesterStatistics>> getAllStatistics() {
        return ResponseEntity.ok(semesterStatisticsRepository.findAll());
    }

    @GetMapping("/statistics/{semesterId}")
    public ResponseEntity<SemesterStatistics> getStatisticsBySemesterId(@PathVariable UUID semesterId) {
        return semesterStatisticsRepository
                .findById(semesterId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employment-rate/{semesterId}")
    public ResponseEntity<List<ChartDataDTO>> getEmploymentRateChart(@PathVariable UUID semesterId) {
        return ResponseEntity.ok(dashboardService.getEmploymentRateChart(semesterId));
    }

    @GetMapping("/interview-pass-rate/{semesterId}")
    public ResponseEntity<List<ChartDataDTO>> getInterviewPassRateChart(@PathVariable UUID semesterId) {
        return ResponseEntity.ok(dashboardService.getInterviewPassRateChart(semesterId));
    }

    @GetMapping("/major-distribution/{semesterId}")
    public ResponseEntity<List<ChartDataDTO>> getMajorDistributionChart(@PathVariable UUID semesterId) {
        return ResponseEntity.ok(dashboardService.getMajorDistributionChart(semesterId));
    }

    @GetMapping("/grade-distribution/{semesterId}")
    public ResponseEntity<List<ChartDataDTO>> getGradeDistributionChart(@PathVariable UUID semesterId) {
        return ResponseEntity.ok(dashboardService.getGradeDistributionChart(semesterId));
    }
}
