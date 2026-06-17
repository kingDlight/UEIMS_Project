package com.ueims.dto.response;

import java.time.LocalDate;
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

    // Enterprise & Semester Info
    UUID enterpriseId;
    String enterpriseName;
    UUID semesterId;
    String semesterCode;

    String status;
    LocalDate startDate;
    LocalDate endDate;
}
