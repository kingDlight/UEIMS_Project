package com.ueims.service.impl;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtRiskStudentResult {

    private UUID assignmentId;
    private UUID studentId;
    private String studentName;
    private String studentCode;
    private UUID semesterId;
    private String semesterCode;
    private String supervisorName;
    private String companyName;

    private Integer missedReports;
    private Integer rejectedReports;

    private String riskCategory;
    private String riskReason;
    private Integer priorityScore;
    private Integer daysAtRisk;
    private Integer applicationCount;
    private Integer reportSubmittedCount;
    private Integer reportApprovedCount;
    private Integer interviewCount;
}
