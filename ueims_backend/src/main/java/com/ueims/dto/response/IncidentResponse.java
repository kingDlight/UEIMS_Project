package com.ueims.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Incident;

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
public class IncidentResponse {
    UUID incidentId;
    UUID assignmentId;
    String studentId;
    String studentName;
    String studentCode;
    String studentEmail;
    String category;
    String description;
    List<String> evidenceUrls;
    String status;
    String resolutionNote;
    LocalDateTime reportedAt;
    LocalDateTime resolvedAt;

    public static IncidentResponse from(Incident incident) {
        if (incident == null) return null;
        String studentId = null;
        String studentName = null;
        String studentCode = null;
        String studentEmail = null;
        UUID assignmentId = null;
        if (incident.getAssignment() != null) {
            assignmentId = incident.getAssignment().getAssignmentId();
            if (incident.getAssignment().getStudent() != null) {
                var student = incident.getAssignment().getStudent();
                studentId = student.getUserId();
                studentName = student.getFullName();
                studentEmail = student.getEmail();
                if (student.getStudentProfile() != null) {
                    studentCode = student.getStudentProfile().getStudentCode();
                }
            }
        }
        return IncidentResponse.builder()
                .incidentId(incident.getIncidentId())
                .assignmentId(assignmentId)
                .studentId(studentId)
                .studentName(studentName)
                .studentCode(studentCode)
                .studentEmail(studentEmail)
                .category(incident.getCategory())
                .description(incident.getDescription())
                .evidenceUrls(incident.getEvidenceUrls())
                .status(incident.getStatus())
                .resolutionNote(incident.getResolutionNote())
                .reportedAt(incident.getCreatedAt())
                .resolvedAt(incident.getResolvedAt())
                .build();
    }
}
