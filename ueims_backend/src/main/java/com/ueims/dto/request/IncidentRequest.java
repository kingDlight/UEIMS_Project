package com.ueims.dto.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentRequest {
    @NotNull(message = "Assignment ID cannot be null")
    private UUID assignmentId;

    @NotNull(message = "Reported By ID cannot be null")
    private UUID reportedById;

    @NotBlank(message = "Category cannot be blank")
    private String category;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    private List<String> evidenceUrls;

    private String status;

    private String resolutionNote;

    private UUID resolvedById;
}
