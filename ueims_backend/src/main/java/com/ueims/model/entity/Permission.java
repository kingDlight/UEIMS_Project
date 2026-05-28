package com.ueims.model.entity;

import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = "rolePermissions")
@ToString(exclude = "rolePermissions")
public class Permission {
    @Id
    @Column(name = "permission_name", length = 100)
    private String permissionName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "permission", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<RolePermission> rolePermissions;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
