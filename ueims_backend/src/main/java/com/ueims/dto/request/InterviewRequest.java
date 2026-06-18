package com.ueims.dto.request;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRequest {
    @NotNull(message = "APPLICATION_ID_MANDATORY")
    private UUID applicationId;

    @NotNull(message = "SCHEDULED_TIME_MANDATORY")
    private LocalDateTime scheduledTime;

    private Integer durationMinutes;

    private String location;

    private String meetingLink;

    private String status;
}
