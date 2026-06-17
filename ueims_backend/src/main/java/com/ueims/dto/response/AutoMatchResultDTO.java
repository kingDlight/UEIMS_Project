package com.ueims.dto.response;

import java.util.List;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Kết quả của bulk auto-match: bao nhiêu SV matched, bao nhiêu skip, chi tiết từng cặp.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AutoMatchResultDTO {

    /** Số application PENDING_APPROVAL được tạo. */
    int matchedCount;

    /** Số SV bị skip (không có DN phù hợp, GPA dưới ngưỡng, v.v.). */
    int skippedCount;

    /** Thời gian chạy (ms). */
    long durationMs;

    /** Chi tiết từng SV đã match: tên, DN được gán, score. */
    List<MatchDetail> details;

    /** Lý do skip cho SV không match được. */
    List<SkipDetail> skipped;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class MatchDetail {
        UUID studentId;
        String studentName;
        String studentCode;
        UUID enterpriseId;
        String enterpriseName;
        UUID applicationId;
        double score;
        String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class SkipDetail {
        UUID studentId;
        String studentName;
        String reason;
    }
}
