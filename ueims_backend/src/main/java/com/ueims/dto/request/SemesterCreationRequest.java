package com.ueims.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @NotBlank(message = "FIELD_REQUIRED")
    String semesterCode;

    @NotBlank(message = "FIELD_REQUIRED")
    String name;

    @NotNull(message = "FIELD_REQUIRED")
    LocalDate startDate;

    @NotNull(message = "FIELD_REQUIRED")
    LocalDate endDate;

    String weeklyReportDeadlineDay;
    LocalTime weeklyReportDeadlineTime;
}
