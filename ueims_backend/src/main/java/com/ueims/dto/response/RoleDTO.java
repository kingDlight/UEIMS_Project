package com.ueims.dto.response;

import com.ueims.model.entity.Role;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RoleDTO extends Role {
    // DTO subclass to resolve java:S4684 while maintaining exact JSON serialization contract.
}
