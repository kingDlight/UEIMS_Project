package com.ueims.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyReportStatusSummaryDTO {
    private String semesterCode;
    private Integer totalWeeks;
    private Integer currentWeek; // tuần hiện tại theo ngày (1..N)
    private Integer submittedCount;
    private Integer approvedCount;
    private Integer overdueCount; // tuần đã trễ mà chưa nộp
    private Integer pendingThisWeek; // tuần hiện tại chưa nộp (count = 0 or 1)
    private List<WeeklyReportStatusDTO> weeks;

    public boolean hasOverdue() {
        return overdueCount != null && overdueCount > 0;
    }
}
