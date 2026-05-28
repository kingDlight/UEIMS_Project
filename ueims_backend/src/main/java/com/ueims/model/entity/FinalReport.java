package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

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
    private UUID finalReportId;

    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "file_size_bytes")
    private Integer fileSizeBytes;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "is_late")
    private Boolean isLate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

}
