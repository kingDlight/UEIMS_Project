package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.WeeklyReport;

public interface WeeklyReportService {
    List<WeeklyReport> findAll();

    WeeklyReport findById(UUID id);

    WeeklyReport save(WeeklyReport entity);

    void deleteById(UUID id);
}
