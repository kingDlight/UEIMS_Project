package com.ueims.model.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "internship_plan_revisions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipPlanRevision {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "revision_id")
    private UUID revisionId;

    @Column(name = "plan_id", nullable = false)
    private UUID planId;

    @Column(name = "actor_id", nullable = false)
    private UUID actorId;

    @Column(name = "actor_role", nullable = false, length = 30)
    private String actorRole;

    @Column(name = "action", nullable = false, length = 30)
    private String action;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "from_status", length = 30)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 30)
    private String toStatus;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}