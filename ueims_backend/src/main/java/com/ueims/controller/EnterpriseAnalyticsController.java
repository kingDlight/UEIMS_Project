package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.response.ApiResponse;
import com.ueims.dto.response.MajorQualityDTO;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.User;
import com.ueims.repository.UserRepository;
import com.ueims.service.EnterpriseAnalyticsService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Analytics endpoints dành cho Enterprise. Hiện tại cung cấp:
 *
 * <ul>
 *   <li>Thống kê chất lượng SV theo ngành (GPA, pass/fail interview, final grade) của DN
 *       trong 1 kỳ hoặc tất cả các kỳ.
 * </ul>
 */
@RestController
@RequestMapping("/api/enterprise/analytics")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ENTERPRISE')")
public class EnterpriseAnalyticsController {

    EnterpriseAnalyticsService analyticsService;
    UserRepository userRepository;

    /**
     * GET /api/enterprise/analytics/student-quality-by-major
     * GET /api/enterprise/analytics/student-quality-by-major?semesterId=xxx
     *
     * @param semesterId optional. Null = tất cả các kỳ DN đã từng nhận SV.
     */
    @GetMapping("/student-quality-by-major")
    public ResponseEntity<ApiResponse<List<MajorQualityDTO>>> getStudentQualityByMajor(
            @RequestParam(required = false) UUID semesterId) {
        UUID enterpriseId = resolveCurrentEnterpriseId();
        List<MajorQualityDTO> data = analyticsService.getStudentQualityByMajor(enterpriseId, semesterId);
        return ResponseEntity.ok(
                ApiResponse.<List<MajorQualityDTO>>builder().result(data).build());
    }

    private UUID resolveCurrentEnterpriseId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (user.getEnterprise() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return user.getEnterprise().getEnterpriseId();
    }
}
