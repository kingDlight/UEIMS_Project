package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "incident_id")
    private UUID incidentId;

    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "reported_by")
    private UUID reportedBy;

    @Column(name = "category")
    private String category;

    @Column(name = "'POOR_ATTITUDE',")
    private String 'POORAttitude',;

    @Column(name = "description")
    private String description;

    @Column(name = "evidence_urls")
    private String evidenceUrls;

    @Column(name = "status")
    private String status;

    @Column(name = "resolution_note")
    private String resolutionNote;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "status")
    private String status;

}
