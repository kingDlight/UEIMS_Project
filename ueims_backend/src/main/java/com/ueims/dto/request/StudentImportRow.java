package com.ueims.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A single row parsed from the TM bulk-import Excel file.
 * Contains fields spanning {@code users}, {@code student_profiles} and
 * {@code eligible_students}. {@code semesterNameOrCode} is the textual key
 * the TM uses in the spreadsheet (e.g. "Fall 2026" or "2026-1") and is
 * resolved to a {@code Semester} entity by the import service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentImportRow {
    /* ===== required (reject row if missing) ===== */
    private String studentCode;
    private String fullName;
    private String email;
    private String major;
    private BigDecimal gpa;
    private Integer currentSemester;
    private String semesterNameOrCode;

    /* ===== optional on users / student_profiles ===== */
    private String phone;
    private String classCode;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String skills;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String bio;
}
