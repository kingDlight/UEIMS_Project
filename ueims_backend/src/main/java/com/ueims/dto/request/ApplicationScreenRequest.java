package com.ueims.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

import com.ueims.model.entity.ApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationScreenRequest {
    @NotNull(message = "Status is required")
    private ApplicationStatus status;

    private String rejectionReason;

    @AssertTrue(message = "Rejection reason is mandatory when rejecting an application")
    private boolean isRejectionReasonValid() {
        if (status == ApplicationStatus.SCREENING_REJECTED) {
            return rejectionReason != null && !rejectionReason.trim().isEmpty();
        }
        return true;
    }

    @AssertTrue(message = "Only SCREENING_PASSED or SCREENING_REJECTED are allowed for this endpoint")
    private boolean isStatusAllowed() {
        return status == ApplicationStatus.SCREENING_PASSED || status == ApplicationStatus.SCREENING_REJECTED;
    }
}
