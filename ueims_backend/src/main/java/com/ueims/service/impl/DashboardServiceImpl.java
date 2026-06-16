package com.ueims.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.dto.dashboard.ChartDataDTO;
import com.ueims.model.dto.dashboard.CommandCenterSummaryDTO;
import com.ueims.model.entity.SemesterStatistics;
import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.FinalGradeRepository;
import com.ueims.repository.IncidentRepository;
import com.ueims.repository.InterviewRepository;
import com.ueims.repository.SemesterStatisticsRepository;
import com.ueims.repository.WeeklyReportRepository;
import com.ueims.service.DashboardService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final String UNKNOWN_TEXT = "Unknown";

    SemesterStatisticsRepository semesterStatisticsRepository;
    EligibleStudentRepository eligibleStudentRepository;
    FinalGradeRepository finalGradeRepository;
    EnterpriseRepository enterpriseRepository;
    IncidentRepository incidentRepository;
    WeeklyReportRepository weeklyReportRepository;
    ApplicationRepository applicationRepository;
    InterviewRepository interviewRepository;
    EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    private List<CommandCenterSummaryDTO.PendingEnterpriseSummary> getPendingEnterpriseSummaries() {
        return enterpriseRepository.findAll().stream()
                .filter(e -> "PENDING".equalsIgnoreCase(e.getStatus()))
                .map(e -> {
                    long daysWaiting = e.getCreatedAt() != null
                            ? ChronoUnit.DAYS.between(e.getCreatedAt(), LocalDateTime.now())
                            : 0;
                    return CommandCenterSummaryDTO.PendingEnterpriseSummary.builder()
                            .id(e.getEnterpriseId())
                            .name(e.getCompanyName())
                            .daysWaiting((int) daysWaiting)
                            .sector(e.getIndustry())
                            .build();
                })
                .toList();
    }

    private List<CommandCenterSummaryDTO.IncidentSummary> getActiveIncidentSummaries() {
        return incidentRepository.findAll().stream()
                .filter(i -> "OPEN".equalsIgnoreCase(i.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(i.getStatus()))
                .map(i -> {
                    long daysAgo = i.getCreatedAt() != null
                            ? ChronoUnit.DAYS.between(i.getCreatedAt(), LocalDateTime.now())
                            : 0;
                    String studentName =
                            i.getReportedBy() != null ? i.getReportedBy().getFullName() : UNKNOWN_TEXT;
                    String studentId = i.getReportedBy() != null
                            ? i.getReportedBy().getUserId().toString()
                            : UNKNOWN_TEXT;
                    String enterpriseName =
                            (i.getAssignment() != null && i.getAssignment().getEnterprise() != null)
                                    ? i.getAssignment().getEnterprise().getCompanyName()
                                    : UNKNOWN_TEXT;

                    return CommandCenterSummaryDTO.IncidentSummary.builder()
                            .id(i.getIncidentId())
                            .name(studentName)
                            .studentId(studentId)
                            .enterprise(enterpriseName)
                            .severity("high") // Mocking severity as it's not in the entity
                            .type(i.getCategory())
                            .daysAgo((int) daysAgo)
                            .build();
                })
                .toList();
    }

    private CommandCenterSummaryDTO.LateStudentSummary createLateStudentSummary(WeeklyReport r) {
        long daysOverdue = r.getCreatedAt() != null
                ? ChronoUnit.DAYS.between(r.getCreatedAt().plusDays(7), LocalDateTime.now())
                : 0;
        String studentName = r.getAssignment() != null && r.getAssignment().getStudent() != null
                ? r.getAssignment().getStudent().getFullName()
                : UNKNOWN_TEXT;
        return CommandCenterSummaryDTO.LateStudentSummary.builder()
                .name(studentName)
                .daysOverdue((int) Math.max(0, daysOverdue))
                .status("LATE")
                .build();
    }

    private static final Set<String> SUBMITTED_STATUSES = Set.of("SUBMITTED", "APPROVED", "REJECTED");
    private static final Set<String> PENDING_STATUSES = Set.of("DRAFT", "PENDING", "NOT_SUBMITTED");

    private CommandCenterSummaryDTO.WeeklyReportSummary getWeeklyReportSummary() {
        List<WeeklyReport> allReports = weeklyReportRepository.findAll();
        int submitted = 0;
        int pending = 0;
        int late = 0;
        int notStarted = 0;
        List<CommandCenterSummaryDTO.LateStudentSummary> lateStudents = new ArrayList<>();

        for (WeeklyReport r : allReports) {
            String s = r.getStatus() != null ? r.getStatus().toUpperCase() : "";
            if (SUBMITTED_STATUSES.contains(s)) {
                submitted++;
            } else if (PENDING_STATUSES.contains(s)) {
                pending++;
            } else if ("LATE".equals(s)) {
                late++;
                lateStudents.add(createLateStudentSummary(r));
            } else {
                notStarted++;
            }
        }

        return CommandCenterSummaryDTO.WeeklyReportSummary.builder()
                .week(1) // Default or calculate from current date
                .submitted(submitted)
                .pending(pending)
                .late(late)
                .notStarted(notStarted)
                .students(lateStudents)
                .build();
    }

    @Override
    public CommandCenterSummaryDTO getCommandCenterSummary() {
        List<CommandCenterSummaryDTO.PendingEnterpriseSummary> pendingSummaries = getPendingEnterpriseSummaries();
        List<CommandCenterSummaryDTO.IncidentSummary> incidentSummaries = getActiveIncidentSummaries();
        CommandCenterSummaryDTO.WeeklyReportSummary reportSummary = getWeeklyReportSummary();

        // 3. Pipeline
        long eligibleCount = eligibleStudentRepository.count();
        long appliedCount = applicationRepository.count();
        long interviewedCount = interviewRepository.count();
        long placedCount = enterpriseAssignmentRepository.count();

        CommandCenterSummaryDTO.PipelineSummary pipelineSummary = CommandCenterSummaryDTO.PipelineSummary.builder()
                .eligible((int) eligibleCount)
                .applied((int) appliedCount)
                .interviewed((int) interviewedCount)
                .placed((int) placedCount)
                .build();

        return CommandCenterSummaryDTO.builder()
                .activeIncidents(incidentSummaries)
                .totalActiveIncidents(incidentSummaries.size())
                .pendingEnterprises(pendingSummaries)
                .totalPendingEnterprises(pendingSummaries.size())
                .pipeline(pipelineSummary)
                .weeklyReports(reportSummary)
                .build();
    }

    @Override
    public List<ChartDataDTO> getEmploymentRateChart(UUID semesterId) {
        SemesterStatistics stats = semesterStatisticsRepository
                .findById(semesterId)
                .orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));
        List<ChartDataDTO> chart = new ArrayList<>();

        long ojt = stats.getTotalOjt() != null ? stats.getTotalOjt() : 0;
        long total = stats.getTotalEligible() != null ? stats.getTotalEligible() : 0;
        long withoutOjt = total - ojt;
        if (withoutOjt < 0) withoutOjt = 0;

        chart.add(new ChartDataDTO("OJT Students", ojt));
        chart.add(new ChartDataDTO("Non-OJT", withoutOjt));
        return chart;
    }

    @Override
    public List<ChartDataDTO> getInterviewPassRateChart(UUID semesterId) {
        SemesterStatistics stats = semesterStatisticsRepository
                .findById(semesterId)
                .orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));
        List<ChartDataDTO> chart = new ArrayList<>();

        long passed = stats.getInterviewsPassed() != null ? stats.getInterviewsPassed() : 0;
        long failed = stats.getInterviewsFailed() != null ? stats.getInterviewsFailed() : 0;

        chart.add(new ChartDataDTO("Passed", passed));
        chart.add(new ChartDataDTO("Failed", failed));
        return chart;
    }

    @Override
    public List<ChartDataDTO> getMajorDistributionChart(UUID semesterId) {
        return eligibleStudentRepository.countStudentsByMajor(semesterId);
    }

    @Override
    public List<ChartDataDTO> getGradeDistributionChart(UUID semesterId) {
        List<BigDecimal> grades = finalGradeRepository.findAllGradeValuesBySemesterId(semesterId);
        int excellent = 0; // 8.5 - 10
        int good = 0; // 7.0 - 8.4
        int average = 0; // 5.0 - 6.9
        int failed = 0; // < 5.0

        for (BigDecimal g : grades) {
            if (g == null) continue;
            double value = g.doubleValue();
            if (value >= 8.5) {
                excellent++;
            } else if (value >= 7.0) {
                good++;
            } else if (value >= 5.0) {
                average++;
            } else {
                failed++;
            }
        }

        List<ChartDataDTO> chart = new ArrayList<>();
        chart.add(new ChartDataDTO("Excellent (8.5 - 10)", excellent));
        chart.add(new ChartDataDTO("Good (7.0 - 8.4)", good));
        chart.add(new ChartDataDTO("Average (5.0 - 6.9)", average));
        chart.add(new ChartDataDTO("Failed (< 5.0)", failed));
        return chart;
    }

    @Override
    public List<ChartDataDTO> getAverageRatingChart(UUID semesterId) {
        SemesterStatistics stats = semesterStatisticsRepository
                .findById(semesterId)
                .orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));
        List<ChartDataDTO> chart = new ArrayList<>();
        BigDecimal avgFinalGrade = stats.getAvgFinalGrade() != null ? stats.getAvgFinalGrade() : BigDecimal.ZERO;
        chart.add(new ChartDataDTO("Average Rating", avgFinalGrade.doubleValue()));
        return chart;
    }
}
