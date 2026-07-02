package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.response.InternshipPlanDTO;
import com.ueims.model.entity.InternshipPlan;

public interface InternshipPlanService {
    List<InternshipPlan> findAll();

    InternshipPlan findById(UUID id);

    /**
     * Plan mà SV đang thực tập có thể thấy (chỉ khi APPROVED + match enterprise/semester).
     */
    InternshipPlan findMyPlan(UUID studentId);

    /**
     * Lấy plan của 1 DN theo kỳ (cả PENDING_APPROVAL và APPROVED).
     */
    InternshipPlan findByEnterpriseAndSemester(UUID enterpriseId, UUID semesterId);

    /**
     * Danh sách plan PENDING_APPROVAL cho TM duyệt.
     */
    List<InternshipPlan> findPendingMasterPlans();

    /** TM duyệt plan. */
    InternshipPlan approveMasterPlan(UUID planId, UUID reviewerId);

    /** TM từ chối plan. */
    InternshipPlan rejectMasterPlan(UUID planId, UUID reviewerId, String reason);

    /**
     * Enterprise tạo hoặc update plan (upsert theo enterprise + semester).
     * Vì UNIQUE constraint, nếu đã có plan PENDING_APPROVAL/APPROVED → update,
     * nếu REJECTED → tạo mới (REJECTED cũ vẫn còn để audit).
     */
    InternshipPlan upsertPlan(InternshipPlanDTO dto, UUID enterpriseId);

    void deleteById(UUID id);
}