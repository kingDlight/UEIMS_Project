package com.ueims.dto.request;

import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePasswordRequest {
    private String oldPassword;

    @Size(min = 8, message = "INVALID_PASSWORD")
    private String newPassword;

    private String confirmPassword;
}
