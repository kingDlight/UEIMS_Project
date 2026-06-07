package com.ueims.config;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.ueims.service.CronJobService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Scheduling Configuration for automated cron jobs.
 * Executes registered cron jobs on Sunday evening at 20:00 (8 PM).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SchedulingConfig {

    private final List<CronJobService> cronJobs;

    /**
     * Scheduled task running every Sunday at 20:00 (8 PM) UTC+7.
     * Cron expression: "0 0 20 ? * SUN" (0 minutes, 0 hours, 20:00, any day of month, any month,
     * Sunday)
     */
    @Scheduled(cron = "0 0 20 ? * SUN", zone = "Asia/Ho_Chi_Minh")
    public void executeWeeklyCronJobs() {
        log.info("Starting weekly cron jobs execution at Sunday 20:00...");
        for (CronJobService job : cronJobs) {
            try {
                log.info("Executing cron job: {}", job.getJobName());
                job.execute();
                log.info("Cron job {} completed successfully", job.getJobName());
            } catch (Exception e) {
                log.error("Error executing cron job: {} - {}", job.getJobName(), e.getMessage(), e);
            }
        }
        log.info("Weekly cron jobs execution finished.");
    }
}
