package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "semester_enterprises")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemesterEnterprise {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "semester_enterprise_id")
    private UUID semesterEnterpriseId;

    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "enterprise_id")
    private UUID enterpriseId;

    @Column(name = "registration_status")
    private String registrationStatus;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "registered_at")
    private LocalDateTime registeredAt;

    @Column(name = "registration_status")
    private String registrationStatus;

}
