package com.ueims.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.response.InternshipPlanDTO;
import com.ueims.dto.response.InternshipPlanRevisionDTO;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.mapper.InternshipPlanMapper;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.service.InternshipPlanService;
import com.ueims.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/internship-plans")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternshipPlanController {
    private final InternshipPlanService service;
    private final InternshipPlanMapper mapper;
    private final UserService userService;
    private final EnterpriseRepository enterpriseRepository;

    /** SV lấy plan đang thực tập (chỉ thấy khi APPROVED + match assignment). */
    @GetMapping("/my-plan")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<InternshipPlanDTO> getMyPlan() {
        var plan = service.findMyPlan(userService.getCurrentUserId());
        if (plan == null) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.ok(mapper.toDto(plan));
    }

    /**
     * Enterprise lấy plan của chính mình theo semester.
     * GET /api/internship-plans/by-enterprise-semester?semesterId=...
     */
    @GetMapping("/by-enterprise-semester")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<InternshipPlanDTO> getByEnterpriseSemester(@RequestParam UUID semesterId) {
        UUID enterpriseId = resolveCurrentEnterpriseId();
        var plan = service.findByEnterpriseAndSemester(enterpriseId, semesterId);
        if (plan == null) {
            // Trả empty DTO (không 404) để frontend biết "chưa có plan"
            return ResponseEntity.ok(mapper.toDto(com.ueims.model.entity.InternshipPlan.builder()
                    .enterprise(Enterprise.builder().enterpriseId(enterpriseId).build())
                    .build()));
        }
        return ResponseEntity.ok(mapper.toDto(plan));
    }

    /** TM xem danh sách plan chờ duyệt. */
    @GetMapping("/pending-master-plans")
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public ResponseEntity<List<InternshipPlanDTO>> getPendingMasterPlans() {
        return ResponseEntity.ok(
                service.findPendingMasterPlans().stream().map(mapper::toDto).toList());
    }

    /** TM duyệt plan. */
    @PostMapping("/{planId}/approve")
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public ResponseEntity<InternshipPlanDTO> approvePlan(@PathVariable UUID planId) {
        UUID tmId = userService.getCurrentUserId();
        return ResponseEntity.ok(mapper.toDto(service.approveMasterPlan(planId, tmId)));
    }

    /** TM từ chối plan. */
    @PostMapping("/{planId}/reject")
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public ResponseEntity<InternshipPlanDTO> rejectPlan(
            @PathVariable UUID planId, @RequestBody Map<String, String> payload) {
        UUID tmId = userService.getCurrentUserId();
        String reason = payload != null ? payload.get("reason") : null;
        return ResponseEntity.ok(mapper.toDto(service.rejectMasterPlan(planId, tmId, reason)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternshipPlanDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    /**
     * Lịch sử submit / revise / approve / reject của 1 plan.
     * Enterprise xem của mình, TM xem tất cả.
     */
    @GetMapping("/{planId}/revisions")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<List<InternshipPlanRevisionDTO>> getRevisions(@PathVariable UUID planId) {
        return ResponseEntity.ok(service.getRevisions(planId));
    }

    /**
     * Enterprise tạo / cập nhật plan.
     * Body: { semesterId, jobPostId?, overallGoal }
     * Trả về plan đã lưu (status = PENDING_APPROVAL).
     */
    @PostMapping
    @PreAuthorize("hasRole('ENTERPRISE')")
    public ResponseEntity<InternshipPlanDTO> createOrUpdate(@RequestBody InternshipPlanDTO dto) {
        UUID enterpriseId = resolveCurrentEnterpriseId();
        var saved = service.upsertPlan(dto, enterpriseId);
        // Load items nếu có
        return ResponseEntity.ok(mapper.toDto(service.findById(saved.getPlanId())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private UUID resolveCurrentEnterpriseId() {
        User current = userService.getCurrentUser();
        if (current == null || current.getEnterprise() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "User is not associated with any enterprise");
        }
        return current.getEnterprise().getEnterpriseId();
    }
}
