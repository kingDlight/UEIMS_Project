package com.ueims.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlacementApplicationRequest {

    @NotNull(message = "Enterprise ID is required")
    UUID enterpriseId;

    /** Lý do SV muốn apply (optional nhưng nên có). */
    @Size(max = 2000, message = "Cover letter must be <= 2000 characters")
    String coverLetter;
}
