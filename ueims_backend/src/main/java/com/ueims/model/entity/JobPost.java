package com.ueims.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

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
    private Semester semester;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "benefits", columnDefinition = "TEXT")
    private String benefits;

    @Column(name = "required_skills", length = 500)
    private String requiredSkills;

    @Column(name = "positions_count", nullable = false)
    private Integer positionsCount;

    @Column(name = "application_deadline", nullable = false)
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
