package com.ueims.dto.response;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * FIX 006-A: Tổng hợp weekly report trên toàn kỳ cho Training Manager.
 * Giúp TM thấy ngay:
 * - SV nào đang trễ hạn (overdue)
 * - SV nào có report bị plagiarism anomaly
 * - Bao nhiêu % SV đã hoàn thành report tuần N
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TmWeeklyReportOverviewDTO {

    private String semesterCode;
    private Integer totalStudents; // tổng SV ACTIVE assignment trong kỳ
    private Integer currentWeek;
    private Integer totalWeeks;
    private Integer totalSubmitted;
    private Integer totalAnomalies;
    private Integer totalOverdueStudents; // SV có ít nhất 1 tuần MISSED

    /** Phân bố trạng thái theo tuần (mỗi tuần: submitted / pending / overdue). */
    private List<WeekDistribution> weekDistribution;

    /** Danh sách SV đang trễ (kèm chi tiết tuần nào missed). */
    private List<OverdueStudentRow> overdueStudents;

    /** Danh sách SV có plagiarism anomaly (cần review). */
    private List<AnomalyReportRow> anomalyReports;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeekDistribution {
        private Integer weekNumber;
        private LocalDate deadline; // CN của tuần đó
        private Integer submittedCount; // SV đã submit tuần này
        private Integer overdueCount; // SV quá deadline mà chưa nộp
        private Integer lateOverriddenCount; // SV nộp trễ nhưng đã được TM override
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverdueStudentRow {
        private String studentId;
        private String studentCode;
        private String studentName;
        private String enterpriseName;
        private List<Integer> missedWeeks; // danh sách tuần bị MISSED
        private Integer totalMissed;
        private String lastContactEmail; // email SV để nhắc
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnomalyReportRow {
        private String reportId;
        private String studentCode;
        private String studentName;
        private String enterpriseName;
        private Integer weekNumber;
        private Double plagiarismScore;
        private java.time.LocalDateTime submittedAt;
    }
}
