package com.ueims.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Request cho TM manual match: gán 1 SV vào 1 DN (bypass bước SV apply).
 * Backend sẽ tạo placement_application (status APPROVED) + enterprise_assignment (ACTIVE) trong 1 transaction.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ManualMatchRequest {

    @NotNull(message = "Student ID is required")
    UUID studentId;

    @NotNull(message = "Enterprise ID is required")
    UUID enterpriseId;

    /** Optional: ghi chú của TM về quyết định match. */
    String note;
}
