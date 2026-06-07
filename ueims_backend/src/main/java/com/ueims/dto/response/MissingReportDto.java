package com.ueims.dto.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing a missing weekly report for an assignment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MissingReportDto {
    private UUID assignmentId;
    private UUID studentId;
    private String studentName;
    private UUID semesterId;
    private Integer weekNumber;
    private String enterpriseName;
}
