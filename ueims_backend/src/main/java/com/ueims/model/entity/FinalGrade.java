package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "final_grades")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalGrade {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "grade_id")
    private java.util.UUID gradeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tm_id", nullable = false)
    private User tm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(name = "enterprise_total_score", precision = 4, scale = 2)
    private BigDecimal enterpriseTotalScore;

    @Column(name = "final_grade", nullable = false, precision = 3, scale = 1)
    private BigDecimal finalGrade;

    @Column(name = "overall_status", nullable = false, length = 20)
    private String overallStatus;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private Boolean isLocked = true;

    @Column(name = "cancelled_reason", columnDefinition = "TEXT")
    private String cancelledReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by")
    private User cancelledBy;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "graded_at", nullable = false)
    @Builder.Default
    private LocalDateTime gradedAt = LocalDateTime.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (gradedAt == null) gradedAt = LocalDateTime.now();
    }
}
