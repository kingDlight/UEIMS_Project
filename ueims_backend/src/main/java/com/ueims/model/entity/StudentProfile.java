package com.ueims.model.entity;

import jakarta.persistence.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.*;

@Entity
@Table(name = "student_profiles")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "user")
@ToString(exclude = "user")
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
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @Column(name = "student_code", nullable = false, unique = true, length = 20)
    private String studentCode;

    @Column(name = "major", nullable = false, length = 255)
    private String major;

    @Column(name = "gpa", precision = 4, scale = 2)
    private java.math.BigDecimal gpa;

    @Column(name = "cv_file_url", length = 500)
    private String cvFileUrl;

    @Column(name = "cv_file_name", length = 255)
    private String cvFileName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "skills", columnDefinition = "jsonb")
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
