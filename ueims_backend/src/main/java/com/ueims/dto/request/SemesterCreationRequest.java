package com.ueims.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SemesterCreationRequest {
    String semesterCode;
    String name;
    LocalDate startDate;
    LocalDate endDate;
    String weeklyReportDeadlineDay;
    LocalTime weeklyReportDeadlineTime;
}
