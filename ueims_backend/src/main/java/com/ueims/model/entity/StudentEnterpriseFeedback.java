package com.ueims.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "student_enterprise_feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentEnterpriseFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "feedback_id")
    private java.util.UUID feedbackId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_id", nullable = false)
    private Enterprise enterprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(name = "training_quality_score", nullable = false)
    private Integer trainingQualityScore;

    @Column(name = "supervisor_support_score", nullable = false)
    private Integer supervisorSupportScore;

    @Column(name = "work_environment_score", nullable = false)
    private Integer workEnvironmentScore;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Column(name = "positive_feedback", columnDefinition = "TEXT")
    private String positiveFeedback;

    @Column(name = "improvement_feedback", columnDefinition = "TEXT")
    private String improvementFeedback;

    @Column(name = "additional_comments", columnDefinition = "TEXT")
    private String additionalComments;

    @Column(name = "submitted_at", nullable = false)
    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();
}
