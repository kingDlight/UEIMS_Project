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

    @Column(name = "assignment_id", nullable = false, unique = true)
    private EnterpriseAssignment assignment;

    @Column(name = "overall_goal", columnDefinition = "TEXT")
    private String overallGoal;

    @Transient
    @Builder.Default
    private Boolean isLocked = false;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private List<InternshipPlanItem> items;
}
