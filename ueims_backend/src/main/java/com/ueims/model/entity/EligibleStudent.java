package com.ueims.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.*;

@Entity
@Table(name = "eligible_students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(
        callSuper = true,
        exclude = {"semester", "user", "cancelledBy"})
@ToString(exclude = {"semester", "user", "cancelledBy"})
public class EligibleStudent extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "eligible_id")
    private UUID eligibleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "eligibleStudents", "jobPosts", "systemAnnouncements"
    })
    private Semester semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "roles", "enterprise"})
    private User user;

    @Column(name = "student_code", nullable = false, length = 20)
    private String studentCode;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "major", nullable = false)
    private String major;

    @Column(name = "gpa", nullable = false, precision = 4, scale = 2)
    private BigDecimal gpa;

    @Column(name = "current_semester", nullable = false)
    private Integer currentSemester;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "ELIGIBLE";

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private Boolean isLocked = false;

    @Column(name = "imported_at", nullable = false)
    @Builder.Default
    private LocalDateTime importedAt = LocalDateTime.now();

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "cancelled_reason", columnDefinition = "TEXT")
    private String cancelledReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "roles", "enterprise"})
    private User cancelledBy;
}
