package com.ueims.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.dto.response.MissingReportDto;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.Semester;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.service.ScanMissingReportsService;
import com.ueims.util.WeekCalculator;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for scanning and tracking missing weekly reports.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ScanMissingReportsServiceImpl implements ScanMissingReportsService {

    SemesterRepository semesterRepository;
    EnterpriseAssignmentRepository assignmentRepository;

    /**
     * Scan for missing reports in the current active semester.
     * @return List of missing report information
     */
    @Override
    public List<MissingReportDto> scanMissingReports() {
        // Find the current/active semester
        LocalDate today = LocalDate.now();
        List<Semester> activeSemesters = semesterRepository.findByStatus("ACTIVE").stream()
                .filter(s -> !s.getStartDate().isAfter(today) && !s.getEndDate().isBefore(today))
                .toList();

        if (activeSemesters.isEmpty()) {
            log.info("No active semester found for current date: {}", today);
            return List.of();
        }

        List<MissingReportDto> allMissingReports = new ArrayList<>();

        for (Semester semester : activeSemesters) {
            Integer currentWeek = WeekCalculator.getCurrentWeek(semester.getStartDate());

            if (currentWeek < 1) {
                log.info("Semester {} has not started yet", semester.getSemesterCode());
                continue;
            }

            log.info(
                    "Scanning for missing reports in semester {} (week {})...",
                    semester.getSemesterCode(),
                    currentWeek);

            // Find assignments with missing or late reports for current week
            List<EnterpriseAssignment> missingAssignments =
                    assignmentRepository.findAssignmentsWithLateReports(semester.getSemesterId(), currentWeek);

            List<MissingReportDto> missingReportsForWeek = missingAssignments.stream()
                    .map(assignment -> MissingReportDto.builder()
                            .assignmentId(assignment.getAssignmentId())
                            .studentId(assignment.getStudent().getUserId())
                            .studentName(assignment.getStudent().getFullName())
                            .semesterId(semester.getSemesterId())
                            .weekNumber(currentWeek)
                            .enterpriseName(assignment.getEnterprise().getCompanyName())
                            .build())
                    .toList();

            allMissingReports.addAll(missingReportsForWeek);

            log.info(
                    "Found {} missing reports for semester {} week {}",
                    missingReportsForWeek.size(),
                    semester.getSemesterCode(),
                    currentWeek);
        }

        return allMissingReports;
    }

    /**
     * Get missing reports for a specific semester and week.
     */
    @Override
    public List<MissingReportDto> getMissingReportsForWeek(UUID semesterId, Integer weekNumber) {
        List<EnterpriseAssignment> missingAssignments =
                assignmentRepository.findAssignmentsWithLateReports(semesterId, weekNumber);

        return missingAssignments.stream()
                .map(assignment -> MissingReportDto.builder()
                        .assignmentId(assignment.getAssignmentId())
                        .studentId(assignment.getStudent().getUserId())
                        .studentName(assignment.getStudent().getFullName())
                        .semesterId(semesterId)
                        .weekNumber(weekNumber)
                        .enterpriseName(assignment.getEnterprise().getCompanyName())
                        .build())
                .toList();
    }
}
