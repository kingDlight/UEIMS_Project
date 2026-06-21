package com.ueims.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RejectApplicationRequest {

    @NotBlank(message = "FIELD_REQUIRED")
    @Size(min = 5, max = 1000, message = "REJECTION_REASON_INVALID_LENGTH")
    String rejectionReason;
}
