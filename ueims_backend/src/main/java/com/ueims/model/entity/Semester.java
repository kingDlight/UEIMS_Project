package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "semesters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Semester {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "semester_code")
    private String semesterCode;

    @Column(name = "name")
    private String name;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "weekly_report_deadline_day")
    private String weeklyReportDeadlineDay;

    @Column(name = "weekly_report_deadline_time")
    private LocalTime weeklyReportDeadlineTime;

    @Column(name = "final_report_deadline")
    private LocalDateTime finalReportDeadline;

    @Column(name = "status")
    private String status;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

}
