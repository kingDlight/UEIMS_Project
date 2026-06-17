package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.PlacementApplicationRequest;
import com.ueims.dto.request.RejectApplicationRequest;
import com.ueims.dto.response.PlacementApplicationResponseDTO;
import com.ueims.service.PlacementApplicationService;
import com.ueims.service.UserService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/placement-applications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlacementApplicationController {

    PlacementApplicationService service;
    UserService userService;

    /**
     * SV submit application vào 1 DN.
     * POST /api/placement-applications
     */
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PlacementApplicationResponseDTO> apply(
            @Valid @RequestBody PlacementApplicationRequest request) {
        UUID studentId = userService.getCurrentUserId();
        return ResponseEntity.ok(service.apply(studentId, request));
    }

    /**
     * TM xem danh sách applications pending.
     * GET /api/placement-applications/pending
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<PlacementApplicationResponseDTO>> getPending() {
        return ResponseEntity.ok(service.getPending());
    }

    /**
     * SV xem applications của mình.
     * GET /api/placement-applications/my
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<PlacementApplicationResponseDTO>> getMyApplications() {
        UUID studentId = userService.getCurrentUserId();
        return ResponseEntity.ok(service.getMyApplications(studentId));
    }

    /**
     * TM approve application. Tự động tạo enterprise_assignment ACTIVE.
     * PUT /api/placement-applications/{id}/approve
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<PlacementApplicationResponseDTO> approve(@PathVariable UUID id) {
        UUID reviewerId = userService.getCurrentUserId();
        return ResponseEntity.ok(service.approve(id, reviewerId));
    }

    /**
     * TM reject application. Lý do bắt buộc.
     * PUT /api/placement-applications/{id}/reject
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<PlacementApplicationResponseDTO> reject(
            @PathVariable UUID id,
            @Valid @RequestBody RejectApplicationRequest request) {
        UUID reviewerId = userService.getCurrentUserId();
        return ResponseEntity.ok(service.reject(id, reviewerId, request));
    }

    /**
     * SV withdraw application.
     * PUT /api/placement-applications/{id}/withdraw
     */
    @PutMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PlacementApplicationResponseDTO> withdraw(@PathVariable UUID id) {
        UUID studentId = userService.getCurrentUserId();
        return ResponseEntity.ok(service.withdraw(id, studentId));
    }
}