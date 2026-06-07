package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ueims.dto.response.MissingReportDto;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.TrainingWarning;
import com.ueims.model.entity.User;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.TrainingWarningRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.MailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service to send email alerts for missing reports and record warnings.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailAlertingService {

    private final MailService mailService;
    private final TrainingWarningRepository trainingWarningRepository;
    private final UserRepository userRepository;
    private final SemesterRepository semesterRepository;

    /**
     * Send alert emails to students with missing reports and record warnings.
     *
     * @param missingReports List of missing report DTOs
     */
    public void alertMissingReports(List<MissingReportDto> missingReports) {
        if (missingReports == null || missingReports.isEmpty()) {
            log.info("No missing reports to alert.");
            return;
        }

        log.info("Sending alerts to {} students with missing reports...", missingReports.size());

        for (MissingReportDto report : missingReports) {
            try {
                // Get student user to find email
                User student = userRepository.findById(report.getStudentId()).orElse(null);
                if (student == null) {
                    log.warn("Student with ID {} not found", report.getStudentId());
                    continue;
                }

                // Send warning email
                mailService.sendLateReportWarningMail(
                        student.getEmail(), student.getFullName(), report.getWeekNumber());

                // Record warning in database
                Semester semester =
                        semesterRepository.findById(report.getSemesterId()).orElse(null);
                if (semester != null) {
                    TrainingWarning warning = TrainingWarning.builder()
                            .student(student)
                            .semester(semester)
                            .weekNumber(report.getWeekNumber())
                            .warningMessage("Student has not submitted weekly report for week " + report.getWeekNumber()
                                    + " for enterprise " + report.getEnterpriseName())
                            .sentAt(LocalDateTime.now())
                            .build();

                    trainingWarningRepository.save(warning);
                } else {
                    log.warn("Semester with ID {} not found for warning record", report.getSemesterId());
                }

                log.info(
                        "Alert sent to {} ({}) for missing week {} report",
                        student.getFullName(),
                        student.getEmail(),
                        report.getWeekNumber());

            } catch (Exception e) {
                log.error("Error sending alert for student {}: {}", report.getStudentId(), e.getMessage(), e);
            }
        }

        log.info("Alert emails sent. Total: {}", missingReports.size());
    }

    /**
     * Send alert email to a single student.
     */
    public void alertSingleMissingReport(MissingReportDto missingReport) {
        alertMissingReports(List.of(missingReport));
    }
}
