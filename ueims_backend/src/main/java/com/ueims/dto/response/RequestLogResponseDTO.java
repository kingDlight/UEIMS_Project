package com.ueims.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ueims.model.entity.RequestLog.HttpMethod;

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
public class RequestLogResponseDTO {
    UUID id;
    String userId;
    String userEmail;
    String sessionId;
    HttpMethod method;
    String endpoint;
    Integer statusCode;
    String ipAddress;
    String userAgent;
    Long responseTimeMs;
    LocalDateTime timestamp;
}
