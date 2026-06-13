package com.ueims.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequest {
    @NotNull(message = "JOB_POST_ID_MANDATORY")
    private UUID jobPostId;

    // studentId is auto-populated from security context (BR-47: Application Snapshot)
    private UUID studentId;

    // cvFileUrl is auto-populated from student's profile (BR-47)
    private String cvFileUrl;

    private Long cvFileSize;
    private String coverLetter;
}
