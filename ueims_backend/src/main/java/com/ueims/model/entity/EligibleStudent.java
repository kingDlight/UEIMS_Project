package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "eligible_students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EligibleStudent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "eligible_id")
    private UUID eligibleId;

    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "student_code")
    private String studentCode;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "major")
    private String major;

    @Column(name = "gpa")
    private BigDecimal gpa;

    @Column(name = "current_semester")
    private Integer currentSemester;

    @Column(name = "status")
    private String status;

    @Column(name = "is_locked")
    private Boolean isLocked;

    @Column(name = "imported_at")
    private LocalDateTime importedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "cancelled_reason")
    private String cancelledReason;

    @Column(name = "cancelled_by")
    private UUID cancelledBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "status")
    private String status;

}
