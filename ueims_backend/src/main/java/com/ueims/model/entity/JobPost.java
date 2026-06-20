package com.ueims.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.hibernate.annotations.SQLRestriction;

import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.*;

@Entity
@Table(name = "job_posts")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLRestriction("deleted_at IS NULL")
public class JobPost extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "job_post_id")
    private java.util.UUID jobPostId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_id", nullable = false)
    @JsonBackReference(value = "enterprise-job-posts")
    private Enterprise enterprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    @NotNull(message = "Semester is mandatory")
    private Semester semester;

    @Column(name = "title", nullable = false, length = 255)
    @NotBlank(message = "Title is mandatory")
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Description is mandatory")
    private String description;

    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "benefits", columnDefinition = "TEXT")
    private String benefits;

    @Column(name = "required_technologies", length = 500)
    private String requiredSkills;

    @Column(name = "max_positions", nullable = false)
    @NotNull(message = "Positions count is mandatory")
    private Integer positionsCount;

    @Column(name = "application_deadline", nullable = false)
    @NotNull(message = "Application deadline is mandatory")
    @Future(message = "Application deadline must be in the future")
    private java.time.LocalDate applicationDeadline;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "OPEN";

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Transient
    private Double compatibilityScore;

    @Transient
    private Boolean isHighlyRecommended;
}
