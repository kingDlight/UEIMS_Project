package com.ueims.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_post_id", nullable = false)
    @NotFound(action = NotFoundAction.IGNORE)
    private JobPost jobPost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "cv_file_url", nullable = false, length = 500)
    private String cvFileUrl;

    @Column(name = "cv_snapshot_url", length = 500)
    private String cvSnapshotUrl;

    @Transient
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screened_by")
    private User screenedBy;

    @Column(name = "screening_note", columnDefinition = "TEXT")
    private String rejectionReason;

    @Transient
    private LocalDateTime interviewDate;

    @Transient
    private String interviewLink;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "cv_download_count", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer cvDownloadCount = 0;

    // BR-26 tracking: records the application ID that triggered this application to become
    // WITHDRAWN. This enables the undo-BR-26 cascade when an enterprise drags ACCEPTED
    // back to a non-terminal state — we can revive only the apps this application withdrew.
    @Column(name = "withdrawn_by_application_id")
    private java.util.UUID withdrawnByApplicationId;

    // BR-26 tracking: the status this application had just before BR-26 set it to
    // WITHDRAWN. Used to restore the correct status when undoing BR-26, rather than
    // blindly resetting to PENDING.
    @Column(name = "previous_status", length = 30)
    @Enumerated(EnumType.STRING)
    private ApplicationStatus previousStatus;
}
