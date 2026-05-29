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

    @NotNull(message = "STUDENT_ID_MANDATORY")
    private UUID studentId;

    @NotNull(message = "CV_FILE_URL_MANDATORY")
    private String cvFileUrl;

    private Long cvFileSize;
    private String coverLetter;
}
