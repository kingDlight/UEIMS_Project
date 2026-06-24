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

    public java.util.UUID getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(java.util.UUID assignmentId) {
        this.assignmentId = assignmentId;
    }
}
