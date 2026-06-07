package com.ueims.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Data;

@Data
public class EligibleStudentRequest {
    private UUID eligibleId;
    private SemesterRequest semester;
    private UserRequest user;
    private String studentCode;
    private String fullName;
    private String email;
    private String major;
    private BigDecimal gpa;
    private Integer currentSemester;
    private String status;
    private Boolean isLocked;
    private LocalDateTime importedAt;
    private LocalDateTime approvedAt;
    private String cancelledReason;
    private UserRequest cancelledBy;

    @Data
    public static class SemesterRequest {
        private UUID semesterId;
    }

    @Data
    public static class UserRequest {
        private UUID userId;
    }
}
