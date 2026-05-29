package com.ueims.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemesterCreationRequest {
    private String semesterCode;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String weeklyReportDeadlineDay;
    private LocalTime weeklyReportDeadlineTime;
}
