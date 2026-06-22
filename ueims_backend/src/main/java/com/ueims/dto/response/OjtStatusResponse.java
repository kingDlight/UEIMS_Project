package com.ueims.dto.response;

import java.util.UUID;

import com.ueims.model.entity.OjtStatus;

public record OjtStatusResponse(
        OjtStatus ojtStatus,
        String statusLabel,
        String statusColor,
        boolean isUrgent,
        String riskReason,
        Integer daysUntilDeadline,
        String deadlineLabel,
        String placementEnterpriseName,
        String contactSupportEmail,
        String contactSupportName,
        Integer applicationCount,
        Integer interviewCount,
        Integer reportCount,
        UUID semesterId,
        String semesterName) {}
