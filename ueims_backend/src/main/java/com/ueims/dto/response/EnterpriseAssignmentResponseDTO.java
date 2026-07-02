package com.ueims.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EnterpriseAssignmentResponseDTO {
    UUID assignmentId;

    // Student Info
    UUID studentId;
    String studentName;
    String studentCode;
    String studentEmail;
    String major;

    // Enterprise & Semester Info
    UUID enterpriseId;
    String enterpriseName;
    UUID semesterId;
    String semesterCode;

    String status;
    LocalDate startDate;
    LocalDate endDate;

    // Supervisor info
    String supervisorName;
    String supervisorEmail;
    String supervisorPhone;

    // Audit fields inherited from BaseEntity
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    // Related Entities IDs
    UUID evaluationId;
    UUID finalReportId;
    String finalReportUrl;
}
