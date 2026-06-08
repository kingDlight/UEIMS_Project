package com.ueims.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ueims.dto.response.MissingReportDto;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.service.CronJobService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Cron job that scans for missing weekly reports.
 * Executed every Sunday at 20:00 (8 PM).
 * Identifies students who haven't submitted their weekly reports for the
 * current week.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScanMissingReportsCronJobImpl implements CronJobService {

    private final ScanMissingReportsService scanService;

    @Override
    public void execute() {
        try {
            log.info("Starting scan for missing weekly reports...");

            List<MissingReportDto> missingReports = scanService.scanMissingReports();

            if (missingReports.isEmpty()) {
                log.info("No missing reports found.");
            } else {
                log.info("Found {} missing reports:", missingReports.size());
                missingReports.forEach(report -> log.warn(
                        "Student {} (ID: {}) from {} has not submitted week {} report",
                        report.getStudentName(),
                        report.getStudentId(),
                        report.getEnterpriseName(),
                        report.getWeekNumber()));
            }

            // Store missing reports for Phase 4 (email alerting)
            // This will be used to send notifications and update At-Risk status
            log.info(
                    "Missing reports scan completed. {} reports to be processed in next phase.", missingReports.size());

        } catch (Exception e) {
            log.error("Error scanning for missing reports: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public String getJobName() {
        return "ScanMissingReportsCronJob";
    }
}
