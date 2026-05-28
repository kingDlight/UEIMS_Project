package com.ueims.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class TrainingWarningRequest {
    private UUID tmId;
    private UUID studentId;
    private UUID semesterId;
    private Integer weekNumber;
    private String warningMessage;
}
