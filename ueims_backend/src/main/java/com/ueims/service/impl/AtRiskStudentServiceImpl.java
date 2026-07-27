package com.ueims.service.impl;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.WeeklyReportRepository;
import com.ueims.service.AtRiskStudentService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AtRiskStudentServiceImpl implements AtRiskStudentService {

    EligibleStudentRepository eligibleStudentRepository;
    EnterpriseAssignmentRepository enterpriseAssignmentRepository;
    SemesterRepository semesterRepository;
    WeeklyReportRepository weeklyReportRepository;
    UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AtRiskStudentResult> getAtRiskStudentsBySemester(UUID semesterId) {
        Semester semester = semesterRepository.findById(semesterId).orElse(null);
        if (semester == null) return List.of();

        List<AtRiskStudentResult> results = new ArrayList<>();
        results.addAll(findUnplacedAtRisk(semester));
        results.addAll(findReportMissedAtRisk(semester));
        results.addAll(findBlockedAtRisk(semester));

        return results.stream()
                .sorted(Comparator.comparing(AtRiskStudentResult::getPriorityScore)
                        .reversed()
                        .thenComparing(AtRiskStudentResult::getDaysAtRisk)
                        .reversed())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AtRiskStudentResult> getAtRiskStudentsBySemester(
            UUID semesterId, String riskCategory, Integer minPriority) {

        List<AtRiskStudentResult> results = getAtRiskStudentsBySemester(semesterId);

        return results.stream()
                .filter(r -> riskCategory == null
                        || "ALL".equalsIgnoreCase(riskCategory)
                        || riskCategory.equalsIgnoreCase(r.getRiskCategory()))
                .filter(r -> minPriority == null || r.getPriorityScore() >= minPriority)
                .toList();
    }

    // ============================================================
    // Group 1: UNPLACED — eligible but no assignment yet
    // ============================================================
    private List<AtRiskStudentResult> findUnplacedAtRisk(Semester semester) {
        List<AtRiskStudentResult> results = new ArrayList<>();

        List<EligibleStudent> eligibleList = eligibleStudentRepository.findBySemester_SemesterIdAndStatusIn(
                semester.getSemesterId(), List.of("ELIGIBLE", "PENDING"));

        for (EligibleStudent es : eligibleList) {
            if (es.getUser() != null && es.getUser().getUserId() != null) {
                Optional<EnterpriseAssignment> existingAssignment =
                        enterpriseAssignmentRepository.findByStudent_UserIdAndSemester_Status(
                                es.getUser().getUserId(), "ACTIVE");

                if (existingAssignment.isPresent()) continue;
            }

            LocalDate startDate = semester.getStartDate() != null ? semester.getStartDate() : LocalDate.now();
            long daysAtRisk = ChronoUnit.DAYS.between(
                    Optional.ofNullable(es.getApprovedAt())
                            .map(la -> la.toLocalDate())
                            .orElse(startDate),
                    LocalDate.now());

            int priorityScore = daysAtRisk >= 14 ? 90 : daysAtRisk >= 7 ? 70 : 50;

            String reason = daysAtRisk >= 14
                    ? "14+ days without placement after OJT approval"
                    : daysAtRisk >= 7
                            ? "7+ days without placement after OJT approval"
                            : "OJT-eligible but no enterprise has accepted this student yet";

            results.add(AtRiskStudentResult.builder()
                    .assignmentId(null)
                    .studentId(es.getUser() != null ? es.getUser().getUserId() : null)
                    .studentName(es.getFullName())
                    .studentCode(es.getStudentCode())
                    .studentEmail(resolveEmail(es.getUser(), es.getEmail()))
                    .semesterId(semester.getSemesterId())
                    .semesterCode(semester.getSemesterCode())
                    .supervisorName(null)
                    .companyName(null)
                    .missedReports(0)
                    .rejectedReports(0)
                    .riskCategory("UNPLACED")
                    .riskReason(reason)
                    .priorityScore(priorityScore)
                    .daysAtRisk((int) daysAtRisk)
                    .applicationCount(0)
                    .reportSubmittedCount(0)
                    .reportApprovedCount(0)
                    .interviewCount(0)
                    .build());
        }

        return results;
    }

    // ============================================================
    // Group 2: REPORT MISSED — placed but missing reports
    // ============================================================
    private List<AtRiskStudentResult> findReportMissedAtRisk(Semester semester) {
        List<AtRiskStudentResult> results = new ArrayList<>();

        List<EnterpriseAssignment> activeAssignments =
                enterpriseAssignmentRepository.findBySemester_SemesterIdAndStatus(semester.getSemesterId(), "ACTIVE");

        for (EnterpriseAssignment ea : activeAssignments) {
            UUID assignmentId = ea.getAssignmentId();
            List<WeeklyReport> reports = weeklyReportRepository.findByAssignment_AssignmentId(assignmentId);

            LocalDate startDate = semester.getStartDate() != null ? semester.getStartDate() : LocalDate.now();
            int expectedWeeks = (int) ChronoUnit.WEEKS.between(startDate, LocalDate.now()) + 1;
            expectedWeeks = Math.max(0, expectedWeeks);

            int submitted = (int) reports.stream()
                    .filter(r -> !"NOT_SUBMITTED".equals(r.getStatus()) && !"DRAFT".equals(r.getStatus()))
                    .count();
            int approved = (int) reports.stream()
                    .filter(r -> "APPROVED".equals(r.getStatus()))
                    .count();
            int rejected = (int) reports.stream()
                    .filter(r -> "REJECTED".equals(r.getStatus()))
                    .count();
            int missed = Math.max(0, expectedWeeks - submitted);

            if (missed == 0 && rejected < 2) continue;

            int priorityScore = Math.min(100, 30 + missed * 10 + rejected * 5);

            String reason = rejected >= 3
                    ? "3+ reports rejected — progress review required"
                    : rejected >= 2
                            ? "2 reports rejected — please revise and resubmit"
                            : missed >= 3
                                    ? "Missed " + missed + " weekly report(s) — risk of failing OJT"
                                    : "Missed " + missed + " recent weekly report(s)";

            results.add(AtRiskStudentResult.builder()
                    .assignmentId(assignmentId)
                    .studentId(ea.getStudent() != null ? ea.getStudent().getUserId() : null)
                    .studentName(ea.getStudent() != null ? ea.getStudent().getFullName() : null)
                    .studentCode(
                            ea.getStudent() != null && ea.getStudent().getStudentProfile() != null
                                    ? ea.getStudent().getStudentProfile().getStudentCode()
                                    : "—")
                    .studentEmail(ea.getStudent() != null ? ea.getStudent().getEmail() : null)
                    .semesterId(semester.getSemesterId())
                    .semesterCode(semester.getSemesterCode())
                    .supervisorName(ea.getSupervisorName())
                    .companyName(ea.getEnterprise() != null ? ea.getEnterprise().getCompanyName() : null)
                    .missedReports(missed)
                    .rejectedReports(rejected)
                    .riskCategory(missed >= 3 || rejected >= 3 ? "DEADLINE" : "REPORT")
                    .riskReason(reason)
                    .priorityScore(priorityScore)
                    .daysAtRisk(missed)
                    .applicationCount(0)
                    .reportSubmittedCount(submitted)
                    .reportApprovedCount(approved)
                    .interviewCount(0)
                    .build());
        }

        return results;
    }

    // ============================================================
    // Group 3: BLOCKED — OJT cancelled
    // ============================================================
    private List<AtRiskStudentResult> findBlockedAtRisk(Semester semester) {
        List<AtRiskStudentResult> results = new ArrayList<>();

        List<EligibleStudent> cancelledList =
                eligibleStudentRepository.findBySemester_SemesterIdAndStatus(semester.getSemesterId(), "CANCELLED");

        for (EligibleStudent es : cancelledList) {
            results.add(AtRiskStudentResult.builder()
                    .assignmentId(null)
                    .studentId(es.getUser() != null ? es.getUser().getUserId() : null)
                    .studentName(es.getFullName())
                    .studentCode(es.getStudentCode())
                    .studentEmail(resolveEmail(es.getUser(), es.getEmail()))
                    .semesterId(semester.getSemesterId())
                    .semesterCode(semester.getSemesterCode())
                    .supervisorName(null)
                    .companyName(null)
                    .missedReports(0)
                    .rejectedReports(0)
                    .riskCategory("BLOCKED")
                    .riskReason(
                            es.getCancelledReason() != null
                                            && !es.getCancelledReason().isBlank()
                                    ? "OJT cancelled: " + es.getCancelledReason()
                                    : "OJT cancelled by the Training Office")
                    .priorityScore(100)
                    .daysAtRisk(0)
                    .applicationCount(0)
                    .reportSubmittedCount(0)
                    .reportApprovedCount(0)
                    .interviewCount(0)
                    .build());
        }

        return results;
    }

    @Override
    public int scanAndSendLateWarnings(UUID semesterId, Integer weekNumber, String userId) {
        return 0;
    }

    /**
     * Best-effort lookup of a student's email. Priority:
     * 1) User entity directly attached to the student
     * 2) EligibleStudent.email column (denormalized copy)
     * 3) UserRepository lookup by studentId (last resort)
     */
    private String resolveEmail(User user, String eligibleEmailFallback) {
        if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
            return user.getEmail();
        }
        if (eligibleEmailFallback != null && !eligibleEmailFallback.isBlank()) {
            return eligibleEmailFallback;
        }
        if (user != null && user.getUserId() != null) {
            return userRepository.findById(user.getUserId()).map(User::getEmail).orElse(null);
        }
        return null;
    }
}
