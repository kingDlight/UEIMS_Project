package com.ueims.dto.request;

import java.util.UUID;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TrainingWarningRequest {
    UUID tmId;
    UUID studentId;
    UUID semesterId;
    Integer weekNumber;
    String warningMessage;
}
