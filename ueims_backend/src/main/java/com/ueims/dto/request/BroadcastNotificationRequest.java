package com.ueims.dto.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BroadcastNotificationRequest {
    /** Optional explicit recipient list. When empty, recipients are derived from `targetRole` (or all users if null). */
    private List<UUID> recipientIds;

    /**
     * Optional role filter. When set, every active user holding this role
     * (e.g. STUDENT, ENTERPRISE, TRAINING_MANAGER, MENTOR, LECTURER) will
     * receive a notification. Ignored when `recipientIds` is non-empty.
     */
    private String targetRole;

    @NotBlank
    @Size(max = 500)
    private String title;

    @NotBlank
    private String message;

    /** GENERAL, WARNING, INCIDENT, SYSTEM_ANNOUNCEMENT, APPROVAL, ... */
    @Builder.Default
    private String type = "GENERAL";

    private String referenceEntity;
    private UUID referenceId;
}
