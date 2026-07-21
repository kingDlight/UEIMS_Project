package com.ueims.dto.response;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyReportStatusDTO {
    private Integer weekNumber;
    private String status; // NOT_SUBMITTED | SUBMITTED | APPROVED | REJECTED | MISSED
    private LocalDate deadline; // target_date (Sunday)
    private Boolean isOverdue; // deadline < today && status NOT_SUBMITTED
    private Boolean isPast; // deadline < today
    private Long daysLate; // null nếu chưa trễ
    private String reportId; // null nếu chưa tạo report
}
