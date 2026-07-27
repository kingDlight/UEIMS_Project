package com.ueims.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Combined view cho tab OJT của Training Manager.
 * Một row = 1 student × 1 semester, với workflow_status tổng hợp.
 *
 * workflow_status giá trị:
 *   UNPLACED          — eligible nhưng chưa apply
 *   PENDING_APPROVAL  — SV đã submit, chờ TM duyệt
 *   REJECTED          — TM đã bác (có application_status tương ứng)
 *   WITHDRAWN         — SV đã tự rút
 *   PLACED            — đã có enterprise_assignments ACTIVE
 *   COMPLETED         — đã hoàn thành OJT
 *   CANCELLED         — assignment bị TERMINATED
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OjtPlacementViewDTO {
    UUID studentId;
    String studentName;
    String studentCode;
    String major;

    UUID semesterId;
    String semesterCode;

    /** Trạng thái workflow tổng hợp (UNPLACED | PENDING_APPROVAL | REJECTED | WITHDRAWN | PLACED | COMPLETED | CANCELLED). */
    String workflowStatus;

    // Assignment info (chỉ có khi PLACED/COMPLETED/CANCELLED)
    UUID assignmentId;
    UUID enterpriseId;
    String enterpriseName;
    String assignmentStatus;

    // Application info (chỉ có khi SV đã submit)
    UUID applicationId;
    String applicationStatus;
    String coverLetter;
    LocalDateTime applicationCreatedAt;

    /**
     * Nguồn tạo application mới nhất:
     *   SELF_SOURCED   = SV tự apply
     *   SYSTEM_MATCHED = TM/hệ thống tạo (auto-match, manual-match, interview pass)
     * Null nếu SV chưa có application nào.
     */
    String source;

    // Self-Replace flag: TRUE nếu application mới nhất là replacement request
    Boolean isReplacement;

    // Deferred note: TM ghi chú khi SV chưa được placement
    String deferredReason;
    String deferredByName;
    LocalDateTime deferredAt;
}
