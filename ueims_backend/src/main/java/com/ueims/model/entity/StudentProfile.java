package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "profile_id")
    private UUID profileId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "student_code")
    private String studentCode;

    @Column(name = "university")
    private String university;

    @Column(name = "major")
    private String major;

    @Column(name = "gpa")
    private BigDecimal gpa;

    @Column(name = "skills")
    private String skills;

    @Column(name = "bio")
    private String bio;

    @Column(name = "cv_file_url")
    private String cvFileUrl;

    @Column(name = "cv_file_size")
    private Integer cvFileSize;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

}
