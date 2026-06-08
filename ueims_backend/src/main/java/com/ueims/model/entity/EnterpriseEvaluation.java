package com.ueims.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.*;

@Entity
@Table(name = "enterprise_evaluations")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnterpriseEvaluation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "evaluation_id")
    private java.util.UUID evaluationId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false, unique = true)
    private EnterpriseAssignment assignment;

    @Column(name = "attitude_score", nullable = false, precision = 4, scale = 2)
    @NotNull(message = "Attitude score is mandatory")
    @Min(0)
    @Max(10)
    private BigDecimal attitudeScore;

    @Column(name = "professionalism_score", nullable = false, precision = 4, scale = 2)
    @NotNull(message = "Professionalism score is mandatory")
    @Min(0)
    @Max(10)
    private BigDecimal professionalismScore;

    @Column(name = "soft_skills_score", nullable = false, precision = 4, scale = 2)
    @NotNull(message = "Soft skills score is mandatory")
    @Min(0)
    @Max(10)
    private BigDecimal softSkillsScore;

    @Column(name = "progress_score", nullable = false, precision = 4, scale = 2)
    @NotNull(message = "Progress score is mandatory")
    @Min(0)
    @Max(10)
    private BigDecimal progressScore;

    // Computed field in DB, mapped as read-only here
    @Column(name = "total_score", insertable = false, updatable = false)
    private BigDecimal totalScore;

    @Column(name = "overall_comments", columnDefinition = "TEXT")
    @Size(max = 5000, message = "Comments must not exceed 5000 characters")
    private String overallComments;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private Boolean isLocked = true;

    @Column(name = "submitted_at", nullable = false)
    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Version
    private Long version;
}
