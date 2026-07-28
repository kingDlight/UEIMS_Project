package com.ueims.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.hibernate.annotations.SQLRestriction;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

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

    /**
     * FIX 049: immutable snapshot of the original quota set when this job post
     * was first created. The runtime {@code positionsCount} is auto-maintained
     * by triggers (decrement on apply, increment on withdraw), bounded above by
     * this snapshot so the post never re-opens more slots than originally
     * authorised.
     */
    @Column(name = "original_max_positions", nullable = false)
    private Integer originalMaxPositions;

    @Column(name = "application_deadline", nullable = false)
    @NotNull(message = "Application deadline is mandatory")
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

    /**
     * Number of non-terminal applications currently held against this post.
     * Populated by {@code JobPostService} for both student and enterprise views so
     * the UI can show "Full" / remaining seats and the student job board can hide
     * fully-booked posts.
     */
    @Transient
    private Long currentApplicationCount;

    /**
     * Convenience flag — true when {@code currentApplicationCount >= positionsCount}.
     * Computed in the service layer; the entity stays a pure data holder.
     */
    @Transient
    private Boolean full;

    /**
     * Convenience snapshot of {@code enterprise.companyName} so the FE can render the
     * enterprise label on job cards without hydrating the full {@link Enterprise}
     * object. Populated by {@code JobPostService} via {@link #populateEnterpriseSnapshot()}.
     */
    @Transient
    @JsonProperty("enterpriseName")
    private String enterpriseName;

    /**
     * Convenience snapshot of {@code enterprise.logoUrl} for the student job board
     * and enterprise job-post card so the FE can render the logo image. Populated by
     * {@code JobPostService} via {@link #populateEnterpriseSnapshot()}.
     */
    @Transient
    @JsonProperty("enterpriseLogoUrl")
    private String enterpriseLogoUrl;

    /**
     * Populates the transient {@code enterpriseName} / {@code enterpriseLogoUrl}
     * fields from the lazily-loaded {@link #enterprise} association. Safe to call
     * even when {@code enterprise} has not been initialised (returns silently).
     */
    public void populateEnterpriseSnapshot() {
        if (this.enterprise == null) {
            return;
        }
        this.enterpriseName = this.enterprise.getCompanyName();
        this.enterpriseLogoUrl = this.enterprise.getLogoUrl();
    }
}
