package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.response.InternshipPlanDTO;
import com.ueims.dto.response.InternshipPlanRevisionDTO;
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
     * Enterprise tạo hoặc revise plan.
     * - Nếu chưa có → INSERT mới (action SUBMITTED), status = PENDING_APPROVAL.
     * - Nếu đã có và status = REJECTED → UPDATE in-place (action REVISED), tăng revision_count,
     *   lưu revision_note, status = PENDING_APPROVAL, xoá rejection_reason cũ.
     * - Nếu đã APPROVED → throw lỗi (không thể revise).
     */
    InternshipPlan upsertPlan(InternshipPlanDTO dto, UUID enterpriseId);

    /** Lịch sử submit/revise/approve/reject của 1 plan. */
    List<InternshipPlanRevisionDTO> getRevisions(UUID planId);

    void deleteById(UUID id);
}
