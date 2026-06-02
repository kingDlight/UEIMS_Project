package com.ueims.dto.request;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyReportRequest {
    private UUID assignmentId;
    private Integer weekNumber;
    private String tasksCompleted;
    private String issuesChallenges;
    private String lessonsLearned;
    private String planNextWeek;
    private String attachmentUrls; // JSON string
    private String status;
}
