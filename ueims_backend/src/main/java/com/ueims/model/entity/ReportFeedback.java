package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "report_feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "feedback_id")
    private UUID feedbackId;

    @Column(name = "report_id")
    private UUID reportId;

    @Column(name = "reviewer_id")
    private UUID reviewerId;

    @Column(name = "feedback_text")
    private String feedbackText;

    @Column(name = "action")
    private String action;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

}
