package com.ueims.model.entity;

import java.util.Set;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true, exclude = "rolePermissions")
@ToString(exclude = "rolePermissions")
public class Permission extends BaseEntity {
    @Id
    @Column(name = "permission_name", length = 100)
    private String permissionName;

    @Column(name = "description", length = 500)
    private String description;

    @OneToMany(mappedBy = "permission", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<RolePermission> rolePermissions;
}
