package com.ueims.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthenticationRequest {
    @NotBlank(message = "FIELD_REQUIRED")
    private String email;

    @NotBlank(message = "FIELD_REQUIRED")
    private String password;
}
