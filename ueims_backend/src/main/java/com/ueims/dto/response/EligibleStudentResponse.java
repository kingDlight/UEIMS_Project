package com.ueims.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EligibleStudentResponse {
    private String studentCode;
    private String fullName;
    private String email;
    private String major;
    private BigDecimal gpa;
    private Integer currentSemester;
}
