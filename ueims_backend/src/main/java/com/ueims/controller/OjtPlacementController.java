package com.ueims.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.response.OjtPlacementViewDTO;
import com.ueims.service.PlacementApplicationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Endpoint riêng cho tab OJT Placement Center (Training Manager view).
 * Trả về combined view: mọi SV eligible + applications + assignments đã merge,
 * giúp FE render 1 lần, không cần gọi nhiều API.
 *
 * GET /api/ojt-placements/view
 */
@RestController
@RequestMapping("/api/ojt-placements")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OjtPlacementController {

    PlacementApplicationService service;

    @GetMapping("/view")
    @PreAuthorize("hasRole('TRAINING_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<OjtPlacementViewDTO>> getOjtView() {
        return ResponseEntity.ok(service.getOjtPlacementView());
    }
}