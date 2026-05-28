package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "final_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "final_report_id")
    private java.util.UUID finalReportId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false, unique = true)
    private EnterpriseAssignment assignment;

    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl;

    @Column(name = "file_size_bytes", nullable = false)
    private Integer fileSizeBytes;

    @Column(name = "submitted_at", nullable = false)
    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "is_late", nullable = false)
    @Builder.Default
    private Boolean isLate = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (submittedAt == null) submittedAt = LocalDateTime.now();
    }
}
