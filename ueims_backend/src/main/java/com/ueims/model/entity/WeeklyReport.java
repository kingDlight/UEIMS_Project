package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "weekly_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "report_id")
    private UUID reportId;

    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "week_number")
    private Integer weekNumber;

    @Column(name = "tasks_completed")
    private String tasksCompleted;

    @Column(name = "issues_challenges")
    private String issuesChallenges;

    @Column(name = "lessons_learned")
    private String lessonsLearned;

    @Column(name = "plan_next_week")
    private String planNextWeek;

    @Column(name = "attachment_urls")
    private String attachmentUrls;

    @Column(name = "status")
    private String status;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "late_override_by")
    private UUID lateOverrideBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
