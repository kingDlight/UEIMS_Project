package com.ueims.service.impl;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.repository.RequestLogRepository;
import com.ueims.service.CronJobService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RequestLogCleanupService implements CronJobService {

    RequestLogRepository repository;

    @Value("${app.request-log.retention-days:7}")
    @NonFinal
    int retentionDays;

    @Value("${app.request-log.file-retention-days:14}")
    @NonFinal
    int fileRetentionDays;

    private static final Path LOG_DIR = Paths.get("logs", "request");
    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupOldLogs() {
        log.info("[RequestLogCleanup] Starting cleanup of old request logs...");
        execute();
    }

    @Override
    public void execute() {
        cleanupDatabaseLogs();
        cleanupFileLogs();
    }

    private void cleanupDatabaseLogs() {
        var cutoff = LocalDate.now().minusDays(retentionDays).atStartOfDay();
        try {
            int deleted = repository.deleteByTimestampBefore(cutoff);
            log.info("[RequestLogCleanup] Deleted {} request log entries older than {} days", deleted, retentionDays);
        } catch (Exception e) {
            log.error("[RequestLogCleanup] Failed to cleanup database request logs", e);
        }
    }

    private void cleanupFileLogs() {
        if (!Files.exists(LOG_DIR)) return;

        var cutoffDate = LocalDate.now().minusDays(fileRetentionDays);
        String cutoffStr = cutoffDate.format(FILE_DATE_FORMAT);

        try (Stream<Path> files = Files.list(LOG_DIR)) {
            files.filter(p -> p.toString().endsWith(".json"))
                    .filter(p -> {
                        String fileName = p.getFileName().toString().replace(".json", "");
                        return fileName.compareTo(cutoffStr) < 0;
                    })
                    .forEach(p -> {
                        try {
                            Files.delete(p);
                            log.debug("[RequestLogCleanup] Deleted file: {}", p.getFileName());
                        } catch (Exception e) {
                            log.warn("[RequestLogCleanup] Failed to delete file: {}", p);
                        }
                    });
        } catch (Exception e) {
            log.error("[RequestLogCleanup] Failed to cleanup file logs", e);
        }
    }

    @Override
    public String getJobName() {
        return "RequestLogCleanupJob";
    }
}
