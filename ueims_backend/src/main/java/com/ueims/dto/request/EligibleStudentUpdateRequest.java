package com.ueims.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class EligibleStudentUpdateRequest {
    @NotBlank(message = "Student code is required")
    @Size(max = 20)
    private String studentCode;

    @NotBlank(message = "Full name is required")
    @Size(max = 100)
    private String fullName;

    @Email(message = "Email must be valid")
    @Size(max = 100)
    private String email;

    @NotBlank(message = "Major is required")
    @Size(max = 100)
    private String major;

    @NotNull(message = "GPA is required")
    @DecimalMin(value = "0.00", message = "GPA must be >= 0.00")
    @DecimalMax(value = "10.00", message = "GPA must be <= 10.00")
    private BigDecimal gpa;

    @Min(value = 1, message = "Current semester must be >= 1")
    @Max(value = 12, message = "Current semester must be <= 12")
    private Integer currentSemester;

    @Size(max = 20)
    @Pattern(
            regexp = "^(NOT_YET_ELIGIBLE|ELIGIBLE|NOT_ELIGIBLE|PENDING|ACCEPTED|MATCHED|OJT|COMPLETED|CANCELLED)$",
            message =
                    "Status must be one of: NOT_YET_ELIGIBLE, ELIGIBLE, NOT_ELIGIBLE, PENDING, ACCEPTED, MATCHED, OJT, COMPLETED, CANCELLED")
    private String status;

    @Size(max = 1000, message = "CANCEL_REASON_INVALID_LENGTH")
    private String cancelledReason;
}
