package com.ueims.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private UUID applicationId;
    private UUID jobPostId;
    private String jobPostTitle;
    private String enterpriseName;
    private UUID studentId;
    private String studentName;
    private String studentEmail;
    private String studentCode;
    private String cvFileUrl;
    private String cvSnapshotUrl;
    private String coverLetter;
    private String status;
    private String rejectionReason;
    private LocalDateTime interviewDate;
    private String interviewLink;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
