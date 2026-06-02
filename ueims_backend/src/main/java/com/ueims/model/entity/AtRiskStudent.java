package com.ueims.model.entity;

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
@Table(name = "v_at_risk_students")
@Immutable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtRiskStudent {

    @Id
    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "student_id")
    private UUID studentId;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "student_code")
    private String studentCode;

    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "semester_code")
    private String semesterCode;

    @Column(name = "supervisor_name")
    private String supervisorName;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "missed_reports")
    private Integer missedReports;

    @Column(name = "rejected_reports")
    private Integer rejectedReports;
}
