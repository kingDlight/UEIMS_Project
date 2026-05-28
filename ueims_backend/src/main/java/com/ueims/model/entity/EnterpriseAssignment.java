package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "enterprise_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnterpriseAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "enterprise_id")
    private UUID enterpriseId;

    @Column(name = "student_id")
    private UUID studentId;

    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "supervisor_name")
    private String supervisorName;

    @Column(name = "supervisor_email")
    private String supervisorEmail;

    @Column(name = "supervisor_phone")
    private String supervisorPhone;

    @Column(name = "assigned_by")
    private UUID assignedBy;

    @Column(name = "status")
    private String status;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
