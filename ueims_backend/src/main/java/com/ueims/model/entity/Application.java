package com.ueims.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.hibernate.annotations.SQLRestriction;

import lombok.*;

@Entity
@Table(name = "applications")
@SQLRestriction("deleted_at IS NULL")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "application_id")
    private java.util.UUID applicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id", nullable = false)
    private JobPost jobPost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "cv_file_url", nullable = false, length = 500)
    private String cvFileUrl;

    @Column(name = "cv_snapshot_url", length = 500)
    private String cvSnapshotUrl;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screened_by")
    private User screenedBy;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "interview_date")
    private LocalDateTime interviewDate;

    @Column(name = "interview_link", length = 500)
    private String interviewLink;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "cv_download_count", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer cvDownloadCount = 0;
}
