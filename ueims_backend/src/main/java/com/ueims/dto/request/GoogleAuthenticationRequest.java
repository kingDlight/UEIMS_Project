package com.ueims.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GoogleAuthenticationRequest {
    @NotBlank(message = "FIELD_REQUIRED")
    String idToken;

    @NotBlank(message = "FIELD_REQUIRED")
    String deviceId;
}
