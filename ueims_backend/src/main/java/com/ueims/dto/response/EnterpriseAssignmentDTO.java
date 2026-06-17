package com.ueims.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EnterpriseAssignmentDTO {
    UUID assignmentId;

    // Student Info
    UUID studentId;
    String studentName;
    String studentCode;

    // Enterprise & Semester Info
    UUID enterpriseId;
    String enterpriseName;
    UUID semesterId;
    String semesterCode;

    String status;
    LocalDate startDate;
    LocalDate endDate;

    // Common entity fields, if this DTO is meant to be a more complete representation
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    // You might add createdBy, updatedBy here if they are part of your EnterpriseAssignment entity
}
