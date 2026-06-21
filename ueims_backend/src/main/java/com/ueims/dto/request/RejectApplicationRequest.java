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

    @NotBlank(message = "Rejection reason is required")
    @Size(min = 5, max = 1000, message = "Rejection reason must be between {min} and {max} characters")
    String rejectionReason;
}
