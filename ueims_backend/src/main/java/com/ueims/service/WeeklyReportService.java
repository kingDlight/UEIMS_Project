package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.WeeklyReport;

public interface WeeklyReportService {
    List<WeeklyReport> findAll();

    List<WeeklyReport> findMyReports();

    List<WeeklyReport> findByEnterprise();

    WeeklyReport findById(UUID id);

    WeeklyReport save(WeeklyReport entity);

    WeeklyReport updateReport(UUID id, com.ueims.dto.request.WeeklyReportRequest request);

    WeeklyReport approveReport(UUID id, String feedback);

    WeeklyReport rejectReport(UUID id, String feedback);

    void deleteById(UUID id);
}
