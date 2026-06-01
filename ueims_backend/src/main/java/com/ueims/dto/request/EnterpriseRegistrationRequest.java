package com.ueims.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

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
public class EnterpriseRegistrationRequest {
    @NotBlank(message = "FIELD_REQUIRED")
    String enterpriseName;

    @NotBlank(message = "FIELD_REQUIRED")
    String taxCode;

    @NotBlank(message = "FIELD_REQUIRED")
    String contactPerson;

    @NotBlank(message = "FIELD_REQUIRED")
    String email;

    @NotBlank(message = "FIELD_REQUIRED")
    String phone;

    @NotBlank(message = "FIELD_REQUIRED")
    String address;

    @NotBlank(message = "FIELD_REQUIRED")
    String password;

    @NotBlank(message = "FIELD_REQUIRED")
    String confirmPassword;
}
