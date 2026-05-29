package com.ueims.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreationRequest {
    @NotBlank(message = "FIELD_REQUIRED")
    private String email;

    @Size(min = 8, message = "INVALID_PASSWORD")
    private String password;

    private String fullName;
    private String phone;
}
