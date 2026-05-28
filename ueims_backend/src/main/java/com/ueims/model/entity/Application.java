package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "application_id")
    private UUID applicationId;

    @Column(name = "job_post_id")
    private UUID jobPostId;

    @Column(name = "student_id")
    private UUID studentId;

    @Column(name = "cv_file_url")
    private String cvFileUrl;

    @Column(name = "cv_snapshot_url")
    private String cvSnapshotUrl;

    @Column(name = "status")
    private String status;

    @Column(name = "'INTERVIEW_SCHEDULED',")
    private String 'INTERVIEWScheduled',;

    @Column(name = "screening_note")
    private String screeningNote;

    @Column(name = "screened_by")
    private UUID screenedBy;

    @Column(name = "screened_at")
    private LocalDateTime screenedAt;

    @Column(name = "withdrawn_at")
    private LocalDateTime withdrawnAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

}
