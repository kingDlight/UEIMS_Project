package com.ueims.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class IncidentResolveRequest {
    @NotNull(message = "Resolved By ID cannot be null")
    private UUID resolvedById;

    @NotBlank(message = "Resolution note is mandatory when closing an incident (BR-50)")
    private String resolutionNote;
}
