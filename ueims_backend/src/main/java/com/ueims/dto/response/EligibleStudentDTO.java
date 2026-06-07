package com.ueims.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record EligibleStudentDTO(
        UUID eligibleId,
        SemesterDTO semester,
        UserDTO user,
        String studentCode,
        String fullName,
        String email,
        String major,
        BigDecimal gpa,
        Integer currentSemester,
        String status,
        Boolean isLocked,
        LocalDateTime importedAt,
        LocalDateTime approvedAt,
        String cancelledReason,
        UserDTO cancelledBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
    public record SemesterDTO(
            UUID semesterId,
            String semesterCode,
            String name,
            LocalDate startDate,
            LocalDate endDate,
            String weeklyReportDeadlineDay,
            LocalTime weeklyReportDeadlineTime,
            String status,
            UserDTO createdBy,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime deletedAt) {}

    public record UserDTO(
            UUID userId,
            String email,
            String fullName,
            String phone,
            String status,
            Integer failedLoginAttempts,
            LocalDateTime lockedUntil,
            Boolean mustChangePassword,
            LocalDateTime passwordChangedAt,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime deletedAt) {}
}
