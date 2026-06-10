package com.ueims.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FinalGradeRequest {
    @NotNull(message = "STUDENT_ID_REQUIRED")
    UUID studentId;

    @NotNull(message = "TM_ID_REQUIRED")
    UUID tmId;

    @NotNull(message = "SEMESTER_ID_REQUIRED")
    UUID semesterId;

    @DecimalMin(value = "0.0", message = "GRADE_MIN_LIMIT")
    @DecimalMax(value = "10.0", message = "GRADE_MAX_LIMIT")
    BigDecimal enterpriseTotalScore;

    @DecimalMin(value = "0.0", message = "GRADE_MIN_LIMIT")
    @DecimalMax(value = "10.0", message = "GRADE_MAX_LIMIT")
    BigDecimal finalGrade;

    String overallStatus;
}
