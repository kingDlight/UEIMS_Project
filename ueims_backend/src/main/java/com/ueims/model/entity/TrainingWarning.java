package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

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
    private UUID warningId;

    @Column(name = "tm_id")
    private UUID tmId;

    @Column(name = "student_id")
    private UUID studentId;

    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "week_number")
    private Integer weekNumber;

    @Column(name = "warning_message")
    private String warningMessage;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

}
