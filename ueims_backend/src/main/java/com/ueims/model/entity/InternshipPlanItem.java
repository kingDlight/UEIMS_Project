package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "internship_plan_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipPlanItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "plan_item_id")
    private UUID planItemId;

    @Column(name = "plan_id")
    private UUID planId;

    @Column(name = "week_number")
    private Integer weekNumber;

    @Column(name = "task_description")
    private String taskDescription;

    @Column(name = "training_objective")
    private String trainingObjective;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "status")
    private String status;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
