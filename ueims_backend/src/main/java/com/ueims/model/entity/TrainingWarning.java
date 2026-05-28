package com.ueims.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "training_warnings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingWarning {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "warning_id")
    private java.util.UUID warningId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tm_id", nullable = false)
    private User tm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "warning_message", nullable = false, columnDefinition = "TEXT")
    private String warningMessage;

    @Column(name = "sent_at", nullable = false)
    @Builder.Default
    private LocalDateTime sentAt = LocalDateTime.now();
}
