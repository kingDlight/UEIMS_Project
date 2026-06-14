package com.ueims.dto.request;

import jakarta.validation.constraints.NotNull;

import com.ueims.model.entity.ApplicationStatus;

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
