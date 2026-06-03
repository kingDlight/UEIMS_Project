package com.ueims.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.*;

import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "job_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLRestriction("deleted_at IS NULL")
public class JobPost {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "job_post_id")
    private java.util.UUID jobPostId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_id", nullable = false)
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

    @Column(name = "required_skills", length = 500)
    private String requiredSkills;

    @Column(name = "positions_count", nullable = false)
    @NotNull(message = "Positions count is mandatory")
    private Integer positionsCount;

    @Column(name = "application_deadline", nullable = false)
    @NotNull(message = "Application deadline is mandatory")
    @Future(message = "Application deadline must be in the future")
    private java.time.LocalDate applicationDeadline;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "OPEN";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
