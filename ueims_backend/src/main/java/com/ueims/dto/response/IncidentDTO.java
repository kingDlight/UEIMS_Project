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
public class IncidentDTO {
    UUID incidentId;
    UUID assignmentId;

    // Student info
    String studentId;
    String studentName;
    String studentCode;
    String studentEmail;

    // Enterprise info
    String enterpriseId;
    String enterpriseName;

    // Reporter info
    String reportedById;
    String reportedByFullName;

    // Resolver info
    String resolvedById;
    String resolvedByFullName;

    // Incident data
    String category;
    String description;
    List<String> evidenceUrls;
    String status;
    String resolutionNote;
    LocalDateTime reportedAt;
    LocalDateTime resolvedAt;

    public static IncidentDTO from(Incident incident) {
        if (incident == null) return null;

        String studentId = null;
        String studentName = null;
        String studentCode = null;
        String studentEmail = null;
        String enterpriseId = null;
        String enterpriseName = null;
        UUID assignmentId = null;

        if (incident.getAssignment() != null) {
            assignmentId = incident.getAssignment().getAssignmentId();
            if (incident.getAssignment().getStudent() != null) {
                var student = incident.getAssignment().getStudent();
                studentId = student.getUserId() != null ? student.getUserId().toString() : null;
                studentName = student.getFullName();
                studentEmail = student.getEmail();
                if (student.getStudentProfile() != null) {
                    studentCode = student.getStudentProfile().getStudentCode();
                }
            }
            if (incident.getAssignment().getEnterprise() != null) {
                enterpriseId = incident.getAssignment().getEnterprise().getEnterpriseId().toString();
                enterpriseName = incident.getAssignment().getEnterprise().getCompanyName();
            }
        }

        String reportedById = null;
        String reportedByFullName = null;
        if (incident.getReportedBy() != null) {
            reportedById = incident.getReportedBy().getUserId().toString();
            reportedByFullName = incident.getReportedBy().getFullName();
        }

        String resolvedById = null;
        String resolvedByFullName = null;
        if (incident.getResolvedBy() != null) {
            resolvedById = incident.getResolvedBy().getUserId().toString();
            resolvedByFullName = incident.getResolvedBy().getFullName();
        }

        return IncidentDTO.builder()
                .incidentId(incident.getIncidentId())
                .assignmentId(assignmentId)
                .studentId(studentId)
                .studentName(studentName)
                .studentCode(studentCode)
                .studentEmail(studentEmail)
                .enterpriseId(enterpriseId)
                .enterpriseName(enterpriseName)
                .reportedById(reportedById)
                .reportedByFullName(reportedByFullName)
                .resolvedById(resolvedById)
                .resolvedByFullName(resolvedByFullName)
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
