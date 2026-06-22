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
import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.SemesterRepository;
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
                .sorted(Comparator
                        .comparing(AtRiskStudentResult::getPriorityScore).reversed()
                        .thenComparing(AtRiskStudentResult::getDaysAtRisk).reversed())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AtRiskStudentResult> getAtRiskStudentsBySemester(
            UUID semesterId, String riskCategory, Integer minPriority) {

        List<AtRiskStudentResult> results = getAtRiskStudentsBySemester(semesterId);

        return results.stream()
                .filter(r -> riskCategory == null || "ALL".equalsIgnoreCase(riskCategory)
                        || riskCategory.equalsIgnoreCase(r.getRiskCategory()))
                .filter(r -> minPriority == null || r.getPriorityScore() >= minPriority)
                .toList();
    }

    // ============================================================
    // Nhóm 1: UNPLACED — eligible nhưng chưa có assignment
    // ============================================================
    private List<AtRiskStudentResult> findUnplacedAtRisk(Semester semester) {
        List<AtRiskStudentResult> results = new ArrayList<>();

        List<EligibleStudent> eligibleList =
                eligibleStudentRepository.findBySemester_SemesterIdAndStatusIn(
                        semester.getSemesterId(), List.of("ELIGIBLE", "PENDING"));

        for (EligibleStudent es : eligibleList) {
            Optional<EnterpriseAssignment> existingAssignment =
                    enterpriseAssignmentRepository.findByStudent_UserIdAndSemester_Status(
                            es.getUser().getUserId(), "ACTIVE");

            if (existingAssignment.isPresent()) continue;

            long daysAtRisk = ChronoUnit.DAYS.between(
                    Optional.ofNullable(es.getApprovedAt())
                            .map(la -> la.toLocalDate())
                            .orElse(semester.getStartDate()),
                    LocalDate.now());

            int priorityScore = daysAtRisk >= 14 ? 90
                    : daysAtRisk >= 7 ? 70
                    : 50;

            String reason = daysAtRisk >= 14
                    ? "Đã 14+ ngày chưa có placement sau khi được duyệt OJT"
                    : daysAtRisk >= 7
                    ? "Đã 7+ ngày chưa có placement sau khi được duyệt OJT"
                    : "Đủ điều kiện OJT nhưng chưa có doanh nghiệp tiếp nhận";

            results.add(AtRiskStudentResult.builder()
                    .assignmentId(null)
                    .studentId(es.getUser().getUserId())
                    .studentName(es.getFullName())
                    .studentCode(es.getStudentCode())
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
    // Nhóm 2: REPORT MISSED — đã placed nhưng miss reports
    // ============================================================
    private List<AtRiskStudentResult> findReportMissedAtRisk(Semester semester) {
        List<AtRiskStudentResult> results = new ArrayList<>();

        List<EnterpriseAssignment> activeAssignments =
                enterpriseAssignmentRepository.findBySemester_SemesterIdAndStatus(
                        semester.getSemesterId(), "ACTIVE");

        for (EnterpriseAssignment ea : activeAssignments) {
            UUID assignmentId = ea.getAssignmentId();
            List<WeeklyReport> reports = weeklyReportRepository.findByAssignment_AssignmentId(assignmentId);

            int expectedWeeks = (int) ChronoUnit.WEEKS.between(
                    semester.getStartDate(), LocalDate.now()) + 1;
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

            int priorityScore = Math.min(100,
                    30 + missed * 10 + rejected * 5);

            String reason = rejected >= 3
                    ? "3+ báo cáo bị từ chối — cần xem xét lại tiến độ"
                    : rejected >= 2
                    ? "2 báo cáo bị từ chối — vui lòng chỉnh sửa và nộp lại"
                    : missed >= 3
                    ? "Missed " + missed + " báo cáo tuần — nguy cơ không đạt OJT"
                    : "Missed " + missed + " báo cáo tuần gần đây";

            results.add(AtRiskStudentResult.builder()
                    .assignmentId(assignmentId)
                    .studentId(ea.getStudent().getUserId())
                    .studentName(ea.getStudent().getFullName())
                    .studentCode(ea.getStudent().getStudentProfile() != null
                            ? ea.getStudent().getStudentProfile().getStudentCode() : "—")
                    .semesterId(semester.getSemesterId())
                    .semesterCode(semester.getSemesterCode())
                    .supervisorName(ea.getSupervisorName())
                    .companyName(ea.getEnterprise() != null
                            ? ea.getEnterprise().getCompanyName() : null)
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
    // Nhóm 3: BLOCKED — bị cancelled
    // ============================================================
    private List<AtRiskStudentResult> findBlockedAtRisk(Semester semester) {
        List<AtRiskStudentResult> results = new ArrayList<>();

        List<EligibleStudent> cancelledList =
                eligibleStudentRepository.findBySemester_SemesterIdAndStatus(
                        semester.getSemesterId(), "CANCELLED");

        for (EligibleStudent es : cancelledList) {
            results.add(AtRiskStudentResult.builder()
                    .assignmentId(null)
                    .studentId(es.getUser().getUserId())
                    .studentName(es.getFullName())
                    .studentCode(es.getStudentCode())
                    .semesterId(semester.getSemesterId())
                    .semesterCode(semester.getSemesterCode())
                    .supervisorName(null)
                    .companyName(null)
                    .missedReports(0)
                    .rejectedReports(0)
                    .riskCategory("BLOCKED")
                    .riskReason(es.getCancelledReason() != null && !es.getCancelledReason().isBlank()
                            ? "Bị hủy OJT: " + es.getCancelledReason()
                            : "OJT bị hủy bởi phòng Đào tạo")
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
}
