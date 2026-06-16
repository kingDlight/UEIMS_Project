package com.ueims.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateSupervisorRequest {
    
    @NotBlank(message = "SUPERVISOR_NAME_REQUIRED")
    String supervisorName;

    @NotBlank(message = "SUPERVISOR_EMAIL_REQUIRED")
    @Email(message = "INVALID_EMAIL_FORMAT")
    String supervisorEmail;

    @NotBlank(message = "SUPERVISOR_PHONE_REQUIRED")
    String supervisorPhone;
}