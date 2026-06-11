package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.response.MissingReportDto;

/**
 * Service for scanning and tracking missing weekly reports.
 */
public interface ScanMissingReportsService {

    /**
     * Scan for missing reports in the current active semester.
     * @return List of missing report information
     */
    List<MissingReportDto> scanMissingReports();

    /**
     * Get missing reports for a specific semester and week.
     */
    List<MissingReportDto> getMissingReportsForWeek(UUID semesterId, Integer weekNumber);
}
