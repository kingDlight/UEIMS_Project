package com.ueims.service.impl;

import org.springframework.stereotype.Service;

import com.ueims.service.CronJobService;

import lombok.extern.slf4j.Slf4j;

/**
 * Placeholder cron job for framework validation.
 * This job will be replaced/extended in Phase 3 and Phase 4.
 */
@Slf4j
@Service
public class PlaceholderCronJobImpl implements CronJobService {

    @Override
    public void execute() {
        log.info("Placeholder cron job executed. Ready for Phase 3 & Phase 4 implementations.");
    }

    @Override
    public String getJobName() {
        return "PlaceholderCronJob";
    }
}
