package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

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
    private UUID feedbackId;

    @Column(name = "student_id")
    private UUID studentId;

    @Column(name = "enterprise_id")
    private UUID enterpriseId;

    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "training_quality_score")
    private Integer trainingQualityScore;

    @Column(name = "supervisor_support_score")
    private Integer supervisorSupportScore;

    @Column(name = "work_environment_score")
    private Integer workEnvironmentScore;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "positive_feedback")
    private String positiveFeedback;

    @Column(name = "improvement_feedback")
    private String improvementFeedback;

    @Column(name = "additional_comments")
    private String additionalComments;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

}
