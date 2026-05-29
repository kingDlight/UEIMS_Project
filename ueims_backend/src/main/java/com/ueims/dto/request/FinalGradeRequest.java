package com.ueims.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FinalGradeRequest {
    UUID studentId;
    UUID tmId;
    UUID semesterId;
    BigDecimal enterpriseTotalScore;
    BigDecimal finalGrade;
    String overallStatus;
}
