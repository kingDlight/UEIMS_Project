package com.ueims.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Data;

@Data
public class FinalGradeRequest {
    private UUID studentId;
    private UUID tmId;
    private UUID semesterId;
    private BigDecimal enterpriseTotalScore;
    private BigDecimal finalGrade;
    private String overallStatus;
}
