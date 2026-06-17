package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.response.ApiResponse;
import com.ueims.model.dto.dashboard.ChartDataDTO;
import com.ueims.model.dto.dashboard.CommandCenterSummaryDTO;
import com.ueims.service.DashboardService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
public class DashboardController {

    DashboardService dashboardService;

    @GetMapping("/command-center-summary")
    public ApiResponse<CommandCenterSummaryDTO> getCommandCenterSummary() {
        return ApiResponse.<CommandCenterSummaryDTO>builder()
                .result(dashboardService.getCommandCenterSummary())
                .build();
    }

    @GetMapping("/employment-rate/{semesterId}")
    public List<ChartDataDTO> getEmploymentRateChart(@PathVariable UUID semesterId) {
        return dashboardService.getEmploymentRateChart(semesterId);
    }

    @GetMapping("/interview-pass-rate/{semesterId}")
    public List<ChartDataDTO> getInterviewPassRateChart(@PathVariable UUID semesterId) {
        return dashboardService.getInterviewPassRateChart(semesterId);
    }

    @GetMapping("/major-distribution/{semesterId}")
    public List<ChartDataDTO> getMajorDistributionChart(@PathVariable UUID semesterId) {
        return dashboardService.getMajorDistributionChart(semesterId);
    }

    @GetMapping("/grade-distribution/{semesterId}")
    public List<ChartDataDTO> getGradeDistributionChart(@PathVariable UUID semesterId) {
        return dashboardService.getGradeDistributionChart(semesterId);
    }

    @GetMapping("/average-rating/{semesterId}")
    public List<ChartDataDTO> getAverageRatingChart(@PathVariable UUID semesterId) {
        return dashboardService.getAverageRatingChart(semesterId);
    }
}
