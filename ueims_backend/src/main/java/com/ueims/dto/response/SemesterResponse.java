package com.ueims.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import com.ueims.model.entity.Semester;

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
public class SemesterResponse {
    UUID semesterId;
    String semesterCode;
    String name;
    LocalDate startDate;
    LocalDate endDate;
    String weeklyReportDeadlineDay;
    LocalTime weeklyReportDeadlineTime;
    String status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    public static SemesterResponse fromEntity(Semester entity) {
        if (entity == null) {
            return null;
        }
        return SemesterResponse.builder()
                .semesterId(entity.getSemesterId())
                .semesterCode(entity.getSemesterCode())
                .name(entity.getName())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .weeklyReportDeadlineDay(entity.getWeeklyReportDeadlineDay())
                .weeklyReportDeadlineTime(entity.getWeeklyReportDeadlineTime())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
