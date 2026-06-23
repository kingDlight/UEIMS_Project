package com.ueims.dto.request;

import jakarta.validation.constraints.NotBlank;

public record DeferStudentRequest(
        @NotBlank(message = "Deferred reason is required")
        String eligibleId,
        @NotBlank(message = "Deferred reason is required")
        String reason
) {}
