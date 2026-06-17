package com.ueims.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditLogResponseDTO {
    String id;
    String userId;
    String userEmail;
    String action;
    String entityType;
    String entityId;
    String details;
    String ipAddress;
    String userAgent;
    LocalDateTime timestamp;
}
