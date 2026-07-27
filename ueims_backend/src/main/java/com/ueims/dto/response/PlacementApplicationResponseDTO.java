package com.ueims.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlacementApplicationResponseDTO {
    UUID applicationId;

    // Student
    UUID studentId;
    String studentName;
    String studentCode;
    String major;

    // Enterprise
    UUID enterpriseId;
    String enterpriseName;

    // Semester
    UUID semesterId;
    String semesterCode;

    // Workflow
    String status;
    String source;
    String coverLetter;
    String rejectionReason;

    // Audit
    UUID reviewedBy;
    String reviewedByName;
    LocalDateTime reviewedAt;

    // Self-Replace
    Boolean isReplacement;
    UUID replacesApplicationId;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
