package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.request.ManualMatchRequest;
import com.ueims.dto.response.AutoMatchResultDTO;
import com.ueims.dto.response.OjtPlacementViewDTO;
import com.ueims.dto.response.PlacementApplicationResponseDTO;
import com.ueims.service.PlacementApplicationService;
import com.ueims.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Endpoint riêng cho tab OJT Placement Center (Training Manager view).
 * Trả về combined view: mọi SV eligible + applications + assignments đã merge,
 * giúp FE render 1 lần, không cần gọi nhiều API.
 *
 * GET    /api/ojt-placements/view
 * POST   /api/ojt-placements/manual-match   { studentId, enterpriseId, note? }
 * POST   /api/ojt-placements/auto-match
 */
@RestController
@RequestMapping("/api/ojt-placements")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OjtPlacementController {

    PlacementApplicationService service;
    UserService userService;

    @GetMapping("/view")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<OjtPlacementViewDTO>> getOjtView() {
        return ResponseEntity.ok(service.getOjtPlacementView());
    }

    @PostMapping("/manual-match")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<PlacementApplicationResponseDTO> manualMatch(@RequestBody @Valid ManualMatchRequest request) {
        UUID tmId = userService.getCurrentUserId();
        return ResponseEntity.ok(service.manualMatch(tmId, request));
    }

    @PostMapping("/auto-match")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<AutoMatchResultDTO> autoMatch() {
        UUID tmId = userService.getCurrentUserId();
        return ResponseEntity.ok(service.autoMatch(tmId));
    }
}
