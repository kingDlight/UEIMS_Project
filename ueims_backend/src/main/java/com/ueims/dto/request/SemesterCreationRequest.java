package com.ueims.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemesterCreationRequest {
    @NotBlank(message = "FIELD_REQUIRED")
    private String semesterCode;

    @NotBlank(message = "FIELD_REQUIRED")
    private String name;

    @NotNull(message = "FIELD_REQUIRED")
    private LocalDate startDate;

    @NotNull(message = "FIELD_REQUIRED")
    private LocalDate endDate;

    private String weeklyReportDeadlineDay;
    private LocalTime weeklyReportDeadlineTime;
}
