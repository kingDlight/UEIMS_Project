package com.ueims.dto.request;

import com.ueims.model.entity.ApplicationStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ApplicationStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private ApplicationStatus status;

    private String interviewDate;

    private String interviewLink;
}
