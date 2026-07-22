package com.ueims.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Plain DTO for WeeklyReport. Composition over inheritance: we deliberately do
 * NOT extend {@link com.ueims.model.entity.WeeklyReport} so the JSON
 * payload does not leak BaseEntity/audit fields, lazy proxies, or attachment
 * payloads that the FE does not need.
 *
 * weekStartDate / weekEndDate are computed from semester.startDate and
 * weekNumber (semester starts on week 1).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyReportDTO {
    private UUID reportId;
    private UUID assignmentId;

    // Report content
    private Integer weekNumber;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private Integer hoursLogged;

    private String tasksCompleted;
    private String issuesChallenges;
    private String lessonsLearned;
    private String planNextWeek;
    private String attachmentUrls;

    // Workflow
    private String status;
    private String feedback;
    private LocalDateTime submittedAt;
    private Double plagiarismScore;
    private Boolean isAnomaly;
    private UUID lateOverrideBy; // FIX 006-C: BR-56 — NULL means no override yet

    // Enrichment
    private String studentName;
    private String studentCode;
    private String studentEmail;
    private String enterpriseName;
}
