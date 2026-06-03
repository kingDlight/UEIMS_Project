package com.ueims.model.entity;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.Immutable;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "v_semester_statistics")
@Immutable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemesterStatistics {

    @Id
    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "semester_code")
    private String semesterCode;

    @Column(name = "semester_name")
    private String semesterName;

    @Column(name = "total_eligible")
    private Long totalEligible;

    @Column(name = "total_ojt")
    private Long totalOjt;

    @Column(name = "total_cancelled")
    private Long totalCancelled;

    @Column(name = "total_applications")
    private Long totalApplications;

    @Column(name = "interviews_passed")
    private Long interviewsPassed;

    @Column(name = "interviews_failed")
    private Long interviewsFailed;

    @Column(name = "avg_final_grade", precision = 5, scale = 2)
    private BigDecimal avgFinalGrade;

    @Column(name = "min_final_grade", precision = 3, scale = 1)
    private BigDecimal minFinalGrade;

    @Column(name = "max_final_grade", precision = 3, scale = 1)
    private BigDecimal maxFinalGrade;
}
