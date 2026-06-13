package com.ueims.model.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.*;

@Entity
@Table(name = "semesters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(
        callSuper = true,
        exclude = {"createdBy", "eligibleStudents", "jobPosts", "systemAnnouncements"})
@ToString(exclude = {"createdBy", "eligibleStudents", "jobPosts", "systemAnnouncements"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Semester extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "semester_code", nullable = false, unique = true, length = 20)
    private String semesterCode;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "weekly_report_deadline_day", length = 10)
    @Builder.Default
    private String weeklyReportDeadlineDay = "SUNDAY";

    @Column(name = "weekly_report_deadline_time")
    private LocalTime weeklyReportDeadlineTime;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "DRAFT";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "roles", "enterprise"})
    private User createdBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EligibleStudent> eligibleStudents;

    @JsonIgnore
    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JobPost> jobPosts;

    @JsonIgnore
    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SystemAnnouncement> systemAnnouncements;
}
