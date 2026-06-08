package com.ueims.model.entity;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "semester_enterprises")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(
        callSuper = true,
        exclude = {"semester", "enterprise", "reviewedBy"})
@ToString(exclude = {"semester", "enterprise", "reviewedBy"})
public class SemesterEnterprise extends BaseEntity {
    @EmbeddedId
    private SemesterEnterpriseId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("semesterId")
    @JoinColumn(name = "semester_id")
    private Semester semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("enterpriseId")
    @JoinColumn(name = "enterprise_id")
    private Enterprise enterprise;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;
}
