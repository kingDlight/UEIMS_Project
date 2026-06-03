package com.ueims.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class IncidentResolveRequest {
    @NotBlank(message = "Resolution note is mandatory when closing an incident (BR-50)")
    private String resolutionNote;
}
