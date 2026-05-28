package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "job_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPost {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "job_post_id")
    private UUID jobPostId;

    @Column(name = "enterprise_id")
    private UUID enterpriseId;

    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "requirements")
    private String requirements;

    @Column(name = "benefits")
    private String benefits;

    @Column(name = "required_technologies")
    private String requiredTechnologies;

    @Column(name = "max_positions")
    private Integer maxPositions;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

}
