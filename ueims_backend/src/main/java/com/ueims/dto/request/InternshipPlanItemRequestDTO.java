package com.ueims.dto.request;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class InternshipPlanItemRequestDTO {
    @NotNull(message = "Plan ID is required")
    private UUID planId;

    @NotNull(message = "Week number is required")
    private Integer weekNumber;

    @NotBlank(message = "Task description is required")
    private String taskDescription;

    private String trainingObjective;

    @NotNull(message = "Target date is required")
    private LocalDate targetDate;

    private Integer orderIndex;
}
