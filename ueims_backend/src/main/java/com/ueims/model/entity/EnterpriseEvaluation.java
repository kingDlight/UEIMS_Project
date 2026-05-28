package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "enterprise_evaluations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnterpriseEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "evaluation_id")
    private UUID evaluationId;

    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "attitude_score")
    private BigDecimal attitudeScore;

    @Column(name = "professionalism_score")
    private BigDecimal professionalismScore;

    @Column(name = "soft_skills_score")
    private BigDecimal softSkillsScore;

    @Column(name = "progress_score")
    private BigDecimal progressScore;

    @Column(name = "total_score")
    private BigDecimal totalScore;

    @Column(name = "ROUND(attitude_score")
    private String ROUND(attitudeScore;

    @Column(name = ")")
    private String );

    @Column(name = "overall_comments")
    private String overallComments;

    @Column(name = "is_locked")
    private Boolean isLocked;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

}
