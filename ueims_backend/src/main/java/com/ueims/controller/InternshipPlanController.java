package com.ueims.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    private final com.ueims.mapper.InternshipPlanMapper mapper;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<com.ueims.dto.response.InternshipPlanDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/my-plan")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<com.ueims.dto.response.InternshipPlanDTO> getMyPlan() {
        com.ueims.model.entity.InternshipPlan plan = service.findMyPlan(userService.getCurrentUserId());
        if (plan == null) {
            return ResponseEntity.ok(mapper.toDto(null));
        }
        return ResponseEntity.ok(mapper.toDto(plan));
    }

    @GetMapping("/by-assignment/{assignmentId}")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<com.ueims.dto.response.InternshipPlanDTO> getByAssignment(@PathVariable UUID assignmentId) {
        com.ueims.model.entity.InternshipPlan plan = service.findByAssignmentId(assignmentId);
        if (plan == null) {
            return ResponseEntity.ok(mapper.toDto(com.ueims.model.entity.InternshipPlan.builder()
                    .assignment(com.ueims.model.entity.EnterpriseAssignment.builder()
                            .assignmentId(assignmentId)
                            .build())
                    .build()));
        }
        return ResponseEntity.ok(mapper.toDto(plan));
    }

    @GetMapping("/by-job-post/{jobPostId}")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ResponseEntity<com.ueims.dto.response.InternshipPlanDTO> getByJobPost(@PathVariable UUID jobPostId) {
        com.ueims.model.entity.InternshipPlan plan = service.findByJobPostId(jobPostId);
        if (plan == null) {
            return ResponseEntity.ok(mapper.toDto(com.ueims.model.entity.InternshipPlan.builder()
                    .jobPost(com.ueims.model.entity.JobPost.builder()
                            .jobPostId(jobPostId)
                            .build())
                    .build()));
        }
        return ResponseEntity.ok(mapper.toDto(plan));
    }

    @GetMapping("/pending-master-plans")
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public ResponseEntity<List<com.ueims.dto.response.InternshipPlanDTO>> getPendingMasterPlans() {
        return ResponseEntity.ok(
                service.findPendingMasterPlans().stream().map(mapper::toDto).toList());
    }

    @PostMapping("/{planId}/approve")
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public ResponseEntity<com.ueims.dto.response.InternshipPlanDTO> approvePlan(@PathVariable UUID planId) {
        return ResponseEntity.ok(mapper.toDto(service.approveMasterPlan(planId)));
    }

    @PostMapping("/{planId}/reject")
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public ResponseEntity<com.ueims.dto.response.InternshipPlanDTO> rejectPlan(
            @PathVariable UUID planId, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(mapper.toDto(service.rejectMasterPlan(planId, payload.get("reason"))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.ueims.dto.response.InternshipPlanDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<com.ueims.dto.response.InternshipPlanDTO> create(
            @Valid @RequestBody com.ueims.dto.response.InternshipPlanDTO entity) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(entity))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
