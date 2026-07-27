package com.ueims.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.response.ApiResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.User;
import com.ueims.repository.UserRepository;
import com.ueims.service.AtRiskStudentService;
import com.ueims.service.MailService;
import com.ueims.service.impl.AtRiskStudentResult;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/at-risk-students")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AtRiskStudentController {

    AtRiskStudentService atRiskStudentService;
    com.ueims.service.ExcelExportService excelExportService;
    MailService mailService;
    UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<AtRiskStudentResult>> getAtRiskStudents(
            @RequestParam UUID semesterId,
            @RequestParam(required = false) String riskCategory,
            @RequestParam(required = false) Integer minPriority) {
        List<AtRiskStudentResult> results =
                atRiskStudentService.getAtRiskStudentsBySemester(semesterId, riskCategory, minPriority);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAtRiskStudents(@RequestParam UUID semesterId) {
        return excelExportService.exportAtRiskStudents(semesterId);
    }

    /**
     * Send an At-Risk alert email to the student identified by {@code studentId}.
     * Body may include an optional {@code semesterId} for lookup; if omitted the
     * controller will scan the cached snapshot to enrich the message.
     */
    @PostMapping("/{studentId}/send-alert")
    public ResponseEntity<ApiResponse<Void>> sendAtRiskAlert(
            @PathVariable UUID studentId,
            @RequestParam UUID semesterId,
            @RequestBody(required = false) SendAlertRequest body) {

        List<AtRiskStudentResult> all = atRiskStudentService.getAtRiskStudentsBySemester(semesterId);

        AtRiskStudentResult target = all.stream()
                .filter(r -> r.getStudentId() != null && r.getStudentId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new AppException(
                        ErrorCode.RESOURCE_NOT_FOUND, "Student is not in the At-Risk list for this semester"));

        String email = target.getStudentEmail();
        if (email == null || email.isBlank()) {
            // Fallback: hit UserRepository directly
            Optional<User> u = userRepository.findById(studentId);
            if (u.isPresent()
                    && u.get().getEmail() != null
                    && !u.get().getEmail().isBlank()) {
                email = u.get().getEmail();
            }
        }
        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Student has no email on file — cannot send alert");
        }

        String riskLabel = RISK_CATEGORY_LABEL.getOrDefault(target.getRiskCategory(), target.getRiskCategory());

        mailService.sendAtRiskAlertMail(
                email,
                target.getStudentName(),
                target.getStudentCode(),
                target.getRiskCategory(),
                riskLabel,
                target.getRiskReason(),
                target.getSemesterCode(),
                target.getPriorityScore(),
                target.getDaysAtRisk(),
                target.getMissedReports(),
                target.getRejectedReports(),
                target.getCompanyName(),
                target.getSupervisorName());

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Alert email queued for " + email)
                .build());
    }

    /** Optional payload for future overrides (e.g. custom subject). */
    @lombok.Data
    public static class SendAlertRequest {
        private String subject;
        private String note;
    }

    private static final java.util.Map<String, String> RISK_CATEGORY_LABEL = new java.util.HashMap<>();

    static {
        RISK_CATEGORY_LABEL.put("UNPLACED", "Unplaced");
        RISK_CATEGORY_LABEL.put("REPORT", "Weekly Reports Missed");
        RISK_CATEGORY_LABEL.put("DEADLINE", "Deadline Risk");
        RISK_CATEGORY_LABEL.put("BLOCKED", "OJT Cancelled");
    }
}
