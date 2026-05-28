package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "interviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "interview_id")
    private UUID interviewId;

    @Column(name = "application_id")
    private UUID applicationId;

    @Column(name = "scheduled_datetime")
    private LocalDateTime scheduledDatetime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "location")
    private String location;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Column(name = "status")
    private String status;

    @Column(name = "student_confirmed")
    private Boolean studentConfirmed;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "student_decline_reason")
    private String studentDeclineReason;

    @Column(name = "result")
    private String result;

    @Column(name = "result_note")
    private String resultNote;

    @Column(name = "decided_by")
    private UUID decidedBy;

    @Column(name = "decided_at")
    private LocalDateTime decidedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "OR")
    private String OR;

}
