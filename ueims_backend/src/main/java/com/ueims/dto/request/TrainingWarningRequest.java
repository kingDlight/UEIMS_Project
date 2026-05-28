package com.ueims.dto.request;

import java.util.UUID;

import lombok.Data;

@Data
public class TrainingWarningRequest {
    private UUID tmId;
    private UUID studentId;
    private UUID semesterId;
    private Integer weekNumber;
    private String warningMessage;
}
