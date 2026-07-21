package com.ueims.model.entity;

import java.util.List;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "internship_plans")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipPlan extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "plan_id")
    private java.util.UUID planId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_id", nullable = false)
    private Enterprise enterprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id")
    private JobPost jobPost;

    @Column(name = "overall_goal", columnDefinition = "TEXT")
    private String overallGoal;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "PENDING_APPROVAL";

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private java.time.LocalDateTime approvedAt;

    @Column(name = "revision_note", columnDefinition = "TEXT")
    private String revisionNote;

    @Column(name = "revision_count", nullable = false)
    @Builder.Default
    private Integer revisionCount = 0;

    @Column(name = "last_revision_at")
    private java.time.LocalDateTime lastRevisionAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_reviewed_by")
    private User lastReviewedBy;

    @Column(name = "last_reviewed_at")
    private java.time.LocalDateTime lastReviewedAt;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private List<InternshipPlanItem> items;
}
