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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = true) // nullable because it can be a master plan
    private EnterpriseAssignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id")
    private JobPost jobPost;

    @Column(name = "overall_goal", columnDefinition = "TEXT")
    private String overallGoal;

    @Transient
    @Builder.Default
    private Boolean isLocked = false;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "PENDING_APPROVAL"; // PENDING_APPROVAL, APPROVED, REJECTED (for master plans)

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private List<InternshipPlanItem> items;
}
