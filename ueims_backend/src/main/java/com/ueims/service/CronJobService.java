package com.ueims.service;

/**
 * Base interface for cron job execution.
 * Implementations should handle specific scheduled tasks.
 */
public interface CronJobService {
    /**
     * Execute the scheduled task
     */
    void execute();

    /**
     * Get the name of this cron job for logging purposes
     */
    String getJobName();
}
