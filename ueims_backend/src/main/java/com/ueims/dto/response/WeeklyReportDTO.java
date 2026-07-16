package com.ueims.dto.response;

import com.ueims.model.entity.WeeklyReport;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class WeeklyReportDTO extends WeeklyReport {
    private java.util.UUID assignmentId;
    private String studentName;
    private String studentCode;
    private String studentEmail;
    private String enterpriseName;

    public java.util.UUID getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(java.util.UUID assignmentId) {
        this.assignmentId = assignmentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentCode() {
        return studentCode;
    }

    public void setStudentCode(String studentCode) {
        this.studentCode = studentCode;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getEnterpriseName() {
        return enterpriseName;
    }

    public void setEnterpriseName(String enterpriseName) {
        this.enterpriseName = enterpriseName;
    }
}
