package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.response.WeeklyReportDTO;
import com.ueims.model.entity.WeeklyReport;

public interface WeeklyReportService {
    List<WeeklyReportDTO> findAllDtos();

    List<WeeklyReport> findAll();

    List<WeeklyReport> findMyReports();

    List<WeeklyReportDTO> findMyReportsDtos();

    List<WeeklyReportDTO> findByEnterprise();

    WeeklyReport findById(UUID id);

    WeeklyReportDTO findByIdDto(UUID id);

    WeeklyReport save(WeeklyReport entity);

    WeeklyReportDTO saveAndEnrich(WeeklyReport entity);

    WeeklyReport updateReport(UUID id, com.ueims.dto.request.WeeklyReportRequest request);

    WeeklyReportDTO updateReportAndEnrich(UUID id, com.ueims.dto.request.WeeklyReportRequest request);

    WeeklyReport approveReport(UUID id, String feedback);

    WeeklyReportDTO approveReportAndEnrich(UUID id, String feedback);

    WeeklyReport rejectReport(UUID id, String feedback);

    WeeklyReportDTO rejectReportAndEnrich(UUID id, String feedback);

    void deleteById(UUID id);

    List<WeeklyReportDTO> enrichDtos(List<WeeklyReport> reports);
}
