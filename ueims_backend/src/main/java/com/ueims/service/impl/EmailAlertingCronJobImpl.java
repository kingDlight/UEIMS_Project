package com.ueims.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ueims.dto.response.MissingReportDto;
import com.ueims.service.CronJobService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Cron job that automatically sends email alerts to students with missing reports
 * and marks them as At-Risk (via TrainingWarning records).
 * Executed every Sunday at 20:00 (8 PM) after Phase 3 scan completes.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailAlertingCronJobImpl implements CronJobService {

    private final ScanMissingReportsService scanService;
    private final EmailAlertingService alertingService;

    @Override
    public void execute() {
        try {
            log.info("Starting email alerting for missing reports...");

            // Scan for missing reports
            List<MissingReportDto> missingReports = scanService.scanMissingReports();

            if (missingReports.isEmpty()) {
                log.info("No missing reports found. No alerts to send.");
                return;
            }

            log.info("Found {} students with missing reports. Sending alerts...", missingReports.size());

            // Send alerts and record warnings
            alertingService.alertMissingReports(missingReports);

            log.info("Email alerting completed. {} alerts sent.", missingReports.size());

        } catch (Exception e) {
            log.error("Error in email alerting cron job: {}", e.getMessage(), e);
            throw new RuntimeException("EmailAlertingCronJob failed", e);
        }
    }

    @Override
    public String getJobName() {
        return "EmailAlertingCronJob";
    }
}
