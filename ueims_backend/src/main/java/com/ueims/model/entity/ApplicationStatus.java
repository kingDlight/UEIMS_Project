package com.ueims.model.entity;

public enum ApplicationStatus {
    PENDING,
    SCREENING_PASSED, // Thay cho APPROVED ở vòng sơ loại
    SCREENING_REJECTED, // Thay cho REJECTED ở vòng sơ loại
    INTERVIEW_SCHEDULED,
    ACCEPTED,
    REJECTED,
    WITHDRAWN
}
