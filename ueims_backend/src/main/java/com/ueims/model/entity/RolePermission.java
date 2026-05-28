package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "role_permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePermission {
    @EmbeddedId
    private RolePermissionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("roleName")
    @JoinColumn(name = "role_name")
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("permissionName")
    @JoinColumn(name = "permission_name")
    private Permission permission;
}
