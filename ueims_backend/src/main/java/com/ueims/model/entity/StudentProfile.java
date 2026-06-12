package com.ueims.model.entity;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "student_profiles")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "profile_id")
    private java.util.UUID profileId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "student_code", nullable = false, unique = true, length = 20)
    private String studentCode;

    @Column(name = "major", nullable = false, length = 255)
    private String major;

    @Column(name = "cv_url", length = 500)
    private String cvUrl;

    @Column(name = "cv_file_name", length = 255)
    private String cvFileName;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "portfolio_url", length = 500)
    private String portfolioUrl;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;
}
