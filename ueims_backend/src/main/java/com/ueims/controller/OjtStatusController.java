package com.ueims.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.response.OjtStatusResponse;
import com.ueims.service.OjtStatusService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/ojt-status")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OjtStatusController {

    OjtStatusService ojtStatusService;

    @GetMapping("/my")
    public ResponseEntity<OjtStatusResponse> getMyOjtStatus() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ojtStatusService.getOjtStatusForCurrentUser(email));
    }
}
