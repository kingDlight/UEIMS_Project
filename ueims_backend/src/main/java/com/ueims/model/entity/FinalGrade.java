package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

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
    private UUID gradeId;

    @Column(name = "student_id")
    private UUID studentId;

    @Column(name = "tm_id")
    private UUID tmId;

    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "enterprise_total_score")
    private BigDecimal enterpriseTotalScore;

    @Column(name = "final_grade")
    private BigDecimal finalGrade;

    @Column(name = "overall_status")
    private String overallStatus;

    @Column(name = "is_locked")
    private Boolean isLocked;

    @Column(name = "cancelled_reason")
    private String cancelledReason;

    @Column(name = "cancelled_by")
    private UUID cancelledBy;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

}
