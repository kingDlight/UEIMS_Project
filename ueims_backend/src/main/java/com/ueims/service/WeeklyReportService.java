package com.ueims.service;

import com.ueims.model.entity.WeeklyReport;
import java.util.List;
import java.util.UUID;

public interface WeeklyReportService {
    List<WeeklyReport> findAll();
    WeeklyReport findById(UUID id);
    WeeklyReport save(WeeklyReport entity);
    void deleteById(UUID id);
}
