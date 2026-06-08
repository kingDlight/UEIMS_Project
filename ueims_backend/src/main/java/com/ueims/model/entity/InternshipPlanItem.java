package com.ueims.model.entity;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "internship_plan_items")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipPlanItem extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "plan_item_id")
    private java.util.UUID planItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private InternshipPlan plan;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "task_description", nullable = false, columnDefinition = "TEXT")
    private String taskDescription;

    @Column(name = "target_date", nullable = false)
    private java.time.LocalDate targetDate;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;
}
