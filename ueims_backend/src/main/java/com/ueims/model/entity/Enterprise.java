package com.ueims.model.entity;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "enterprises")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"approvedBy", "users", "jobPosts"})
@ToString(exclude = {"approvedBy", "users", "jobPosts"})
public class Enterprise {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "enterprise_id")
    private UUID enterpriseId;

    @Column(name = "company_name", nullable = false, length = 500)
    private String companyName;

    @Column(name = "tax_code", nullable = false, unique = true, length = 50)
    private String taxCode;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "contact_person", length = 255)
    private String contactPerson;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "enterprise")
    private Set<User> users;

    @OneToMany(mappedBy = "enterprise", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JobPost> jobPosts;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
