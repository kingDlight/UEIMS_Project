package com.ueims.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.*;

@Entity
@Table(name = "weekly_reports")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyReport extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "report_id")
    private java.util.UUID reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "enterprise", "student", "semester"})
    private EnterpriseAssignment assignment;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "tasks_completed", columnDefinition = "TEXT")
    private String tasksCompleted;

    @Column(name = "issues_challenges", columnDefinition = "TEXT")
    private String issuesChallenges;

    @Column(name = "lessons_learned", columnDefinition = "TEXT")
    private String lessonsLearned;

    @Column(name = "plan_next_week", columnDefinition = "TEXT")
    private String planNextWeek;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attachment_urls", columnDefinition = "JSONB")
    private String attachmentUrls;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "NOT_SUBMITTED";

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "plagiarism_score")
    private Double plagiarismScore;

    @Column(name = "is_anomaly")
    @Builder.Default
    private Boolean isAnomaly = false;
}
