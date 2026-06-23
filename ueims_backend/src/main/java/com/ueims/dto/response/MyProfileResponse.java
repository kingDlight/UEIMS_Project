package com.ueims.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyProfileResponse {
    // User fields
    private UUID userId;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String status;

    // StudentProfile fields
    private UUID profileId;
    private String studentCode;
    private String major;
    private String skills;
    private String cvFileUrl;
    private String cvFileName;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String bio;

    // EligibleStudent / Semester fields
    private String semesterName;
    private String semesterCode;
    private Integer currentSemester;
    private BigDecimal gpa;
    private String ojtStatus;
}
