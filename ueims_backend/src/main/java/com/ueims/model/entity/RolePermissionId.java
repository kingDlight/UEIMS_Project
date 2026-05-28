package com.ueims.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionId implements Serializable {
    @Column(name = "role_name", length = 50)
    private String roleName;

    @Column(name = "permission_name", length = 100)
    private String permissionName;
}
