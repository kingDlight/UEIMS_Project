package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.response.TmWeeklyReportOverviewDTO;
import com.ueims.dto.response.WeeklyReportDTO;
import com.ueims.dto.response.WeeklyReportStatusSummaryDTO;
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

    /**
     * FIX 006-C: BR-56 — TM override cho weekly report nộp trễ.
     * Set late_override_by = currentUser.id, lưu reason vào feedback (append).
     */
    WeeklyReport overrideLateSubmission(UUID id, String reason);

    WeeklyReportDTO overrideLateAndEnrich(UUID id, String reason);

    List<WeeklyReportDTO> enrichDtos(List<WeeklyReport> reports);

    /**
     * Tính trạng thái weekly report của SV hiện tại theo từng tuần trong kỳ.
     * Trả về danh sách tuần 1..N với status (NOT_SUBMITTED / SUBMITTED / APPROVED / REJECTED / MISSED),
     * deadline (Sunday), isOverdue, daysLate. Dùng cho dashboard cảnh báo.
     */
    WeeklyReportStatusSummaryDTO getMyWeeklyReportStatusSummary();

    /**
     * FIX 006-A: Tổng hợp weekly report trên toàn kỳ cho Training Manager.
     * Trả về thống kê overdue + anomaly + week distribution.
     */
    TmWeeklyReportOverviewDTO getTmOverview(java.util.UUID semesterId);
}
