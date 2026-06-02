package com.ueims.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class IncidentReportRequest {
    @NotNull(message = "Assignment ID cannot be null")
    private UUID assignmentId;

    @NotNull(message = "Reported By ID cannot be null")
    private UUID reportedById;

    @NotBlank(message = "Category cannot be blank")
    private String category;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    private java.util.List<String> evidenceUrls;
}
