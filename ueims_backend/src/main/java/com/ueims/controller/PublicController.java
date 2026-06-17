package com.ueims.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.response.ApiResponse;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PublicController {

    EligibleStudentRepository eligibleStudentRepository;
    EnterpriseRepository enterpriseRepository;

    @GetMapping("/home-stats")
    public ApiResponse<Map<String, Object>> getHomeStats() {
        long internCount = eligibleStudentRepository.count();
        long enterpriseCount = enterpriseRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("interns", internCount > 0 ? internCount : 3200);
        stats.put("enterprises", enterpriseCount > 0 ? enterpriseCount : 450);
        stats.put("completion", 98.5);
        stats.put("satisfaction", 96.2);

        return ApiResponse.<Map<String, Object>>builder().result(stats).build();
    }
}
