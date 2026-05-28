package com.ueims.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.*;

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
    private java.util.UUID evaluationId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false, unique = true)
    private EnterpriseAssignment assignment;

    @Column(name = "attitude_score", nullable = false, precision = 4, scale = 2)
    private BigDecimal attitudeScore;

    @Column(name = "professionalism_score", nullable = false, precision = 4, scale = 2)
    private BigDecimal professionalismScore;

    @Column(name = "soft_skills_score", nullable = false, precision = 4, scale = 2)
    private BigDecimal softSkillsScore;

    @Column(name = "progress_score", nullable = false, precision = 4, scale = 2)
    private BigDecimal progressScore;

    // Computed field in DB, mapped as read-only here
    @Column(name = "total_score", insertable = false, updatable = false)
    private BigDecimal totalScore;

    @Column(name = "overall_comments", columnDefinition = "TEXT")
    private String overallComments;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private Boolean isLocked = true;

    @Column(name = "submitted_at", nullable = false)
    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (submittedAt == null) submittedAt = LocalDateTime.now();
    }
}
