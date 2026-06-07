package com.ueims.service.impl;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.model.entity.AtRiskStudent;
import com.ueims.model.entity.Semester;
import com.ueims.repository.AtRiskStudentRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.service.AtRiskStudentService;
import com.ueims.service.TrainingWarningService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AtRiskStudentServiceImpl implements AtRiskStudentService {
    private final AtRiskStudentRepository atRiskStudentRepository;
    private final SemesterRepository semesterRepository;
    private final TrainingWarningService trainingWarningService;

    @Override
    @Transactional(readOnly = true)
    public List<AtRiskStudent> getAtRiskStudentsBySemester(UUID semesterId) {
        return atRiskStudentRepository.findBySemesterId(semesterId);
    }

    @Scheduled(cron = "0 0 20 ? * SUN", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void scanAndProcessLateReportsAutomatically() {
        log.info("Starting automated job to scan for late weekly reports...");

        List<Semester> activeSemesters = semesterRepository.findByStatus("ACTIVE");
        if (activeSemesters == null || activeSemesters.isEmpty()) {
            log.info("No ACTIVE semester found. Skipping late report scan.");
            return;
        }

        for (Semester semester : activeSemesters) {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            if (yesterday.isBefore(semester.getStartDate()) || yesterday.isAfter(semester.getEndDate())) {
                log.info(
                        "Current date is outside the active period of semester {}. Skipping.",
                        semester.getSemesterCode());
                continue;
            }

            long daysBetween = ChronoUnit.DAYS.between(semester.getStartDate(), yesterday);
            int weekNumber = (int) (daysBetween / 7) + 1;

            log.info("Scanning for late reports for week {} in semester {}", weekNumber, semester.getSemesterCode());
            int count = trainingWarningService.scanAndSendLateWarnings(semester.getSemesterId(), weekNumber, null);
            log.info(
                    "Completed automated scan for semester {}. Generated {} warnings.",
                    semester.getSemesterCode(),
                    count);
        }
    }
}
