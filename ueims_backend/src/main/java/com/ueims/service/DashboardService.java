package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.dto.dashboard.ChartDataDTO;

public interface DashboardService {
    List<ChartDataDTO> getEmploymentRateChart(UUID semesterId);

    List<ChartDataDTO> getInterviewPassRateChart(UUID semesterId);

    List<ChartDataDTO> getMajorDistributionChart(UUID semesterId);

    List<ChartDataDTO> getGradeDistributionChart(UUID semesterId);
}
