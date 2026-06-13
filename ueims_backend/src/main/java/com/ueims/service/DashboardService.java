package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.dto.dashboard.ChartDataDTO;
import com.ueims.model.dto.dashboard.CommandCenterSummaryDTO;

public interface DashboardService {
    CommandCenterSummaryDTO getCommandCenterSummary();

    List<ChartDataDTO> getEmploymentRateChart(UUID semesterId);

    List<ChartDataDTO> getInterviewPassRateChart(UUID semesterId);

    List<ChartDataDTO> getMajorDistributionChart(UUID semesterId);

    List<ChartDataDTO> getGradeDistributionChart(UUID semesterId);

    List<ChartDataDTO> getAverageRatingChart(UUID semesterId);
}
