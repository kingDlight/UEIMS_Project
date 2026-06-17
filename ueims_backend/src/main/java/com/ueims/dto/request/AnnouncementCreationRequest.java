package com.ueims.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementCreationRequest {
    @NotBlank(message = "Title is mandatory")
    private String title;

    @NotBlank(message = "Content is mandatory")
    private String content;

    private UUID semesterId;

    /** GENERAL / WARNING / INCIDENT / SYSTEM_ANNOUNCEMENT / APPROVAL — maps to notifications.type */
    private String type;

    /** ALL / STUDENTS / ENTERPRISE / LECTURER / MENTOR / ADMIN / SEMESTER — purely descriptive / for history list */
    private String audience;

    /** Role enum for NotificationService.broadcast(); null = broadcast to all users */
    private String targetRole;
}
