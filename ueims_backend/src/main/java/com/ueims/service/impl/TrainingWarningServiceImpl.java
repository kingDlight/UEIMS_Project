package com.ueims.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.TrainingWarning;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.TrainingWarningRepository;
import com.ueims.repository.WeeklyReportRepository;
import com.ueims.service.MailService;
import com.ueims.service.TrainingWarningService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrainingWarningServiceImpl implements TrainingWarningService {
    private final TrainingWarningRepository repository;
    private final WeeklyReportRepository weeklyReportRepository;
    private final EnterpriseAssignmentRepository enterpriseAssignmentRepository;
    private final MailService mailService;

    @Override
    public List<TrainingWarning> findAll() {
        return repository.findAll();
    }

    @Override
    public TrainingWarning findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public TrainingWarning save(TrainingWarning entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Transactional
    @Override
    public int scanAndSendLateWarnings(UUID semesterId, Integer weekNumber, UUID tmId) {
        List<EnterpriseAssignment> lateAssignments =
                enterpriseAssignmentRepository.findAssignmentsWithLateReports(semesterId, weekNumber);

        if (lateAssignments.isEmpty()) {
            return 0;
        }

        Semester semester = new Semester();
        semester.setSemesterId(semesterId);

        User tm = null;
        if (tmId != null) {
            tm = new User();
            tm.setUserId(tmId);
        }

        List<TrainingWarning> warningsToSave = new ArrayList<>();
        int count = 0;

        for (EnterpriseAssignment assignment : lateAssignments) {
            User student = assignment.getStudent();

            TrainingWarning warning = new TrainingWarning();
            warning.setSemester(semester);
            warning.setTm(tm);
            warning.setStudent(student);
            warning.setWeekNumber(weekNumber);
            warning.setWarningMessage("Bạn chưa nộp báo cáo tuần " + weekNumber + " đúng hạn.");

            warningsToSave.add(warning);

            String fullName = student.getFullName();
            String email = student.getEmail();

            if (email != null && !email.isEmpty()) {
                mailService.sendLateReportWarningMail(email, fullName, weekNumber);
            }
            count++;
        }

        repository.saveAll(warningsToSave);

        log.info("Sent {} late report warnings for week {} in semester {}", count, weekNumber, semesterId);
        return count;
    }
}
