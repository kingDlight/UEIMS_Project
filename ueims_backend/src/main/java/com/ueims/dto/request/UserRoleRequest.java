package com.ueims.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleRequest {
    @NotNull(message = "User ID is mandatory")
    private UUID userId;

    @NotBlank(message = "Role name is mandatory")
    private String roleName;
}
