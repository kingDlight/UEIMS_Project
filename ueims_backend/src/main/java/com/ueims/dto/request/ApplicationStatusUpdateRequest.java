package com.ueims.dto.request;

import jakarta.validation.constraints.AssertTrue;
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

    private String rejectionReason;

    @AssertTrue(message = "Rejection reason is required when status is REJECTED")
    private boolean isValidRejectionReason() {
        if (status == ApplicationStatus.REJECTED) {
            return rejectionReason != null && !rejectionReason.trim().isEmpty();
        }
        return true;
    }
}
