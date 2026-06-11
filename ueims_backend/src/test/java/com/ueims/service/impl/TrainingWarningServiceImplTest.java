package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.TrainingWarning;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.TrainingWarningRepository;
import com.ueims.repository.WeeklyReportRepository;
import com.ueims.service.MailService;

@ExtendWith(MockitoExtension.class)
class TrainingWarningServiceImplTest {

    @Mock
    private TrainingWarningRepository repository;

    @Mock
    private WeeklyReportRepository weeklyReportRepository;

    @Mock
    private EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    static class MockMailService extends MailService {
        String lastTo;
        String lastFullName;
        Integer lastWeekNumber;

        public MockMailService() {
            super(null, null);
        }

        @Override
        public void sendLateReportWarningMail(String to, String fullName, Integer weekNumber) {
            this.lastTo = to;
            this.lastFullName = fullName;
            this.lastWeekNumber = weekNumber;
        }
    }

    private MockMailService mailService;
    private TrainingWarningServiceImpl service;
    private TrainingWarning warning;
    private UUID warningId;

    @BeforeEach
    void setUp() {
        mailService = new MockMailService();
        service = new TrainingWarningServiceImpl(
                repository, weeklyReportRepository, enterpriseAssignmentRepository, mailService);

        warningId = UUID.randomUUID();
        warning = new TrainingWarning();
        warning.setWarningId(warningId);
    }

    @Test
    void findAll_returnsList() {
        when(repository.findAll()).thenReturn(List.of(warning));
        List<TrainingWarning> result = service.findAll();
        assertEquals(1, result.size());
    }

    @Test
    void findById_exists_returnsWarning() {
        when(repository.findById(warningId)).thenReturn(Optional.of(warning));
        TrainingWarning result = service.findById(warningId);
        assertNotNull(result);
        assertEquals(warningId, result.getWarningId());
    }

    @Test
    void findById_notExists_returnsNull() {
        when(repository.findById(any())).thenReturn(Optional.empty());
        TrainingWarning result = service.findById(UUID.randomUUID());
        assertNull(result);
    }

    @Test
    void save_success() {
        when(repository.save(warning)).thenReturn(warning);
        TrainingWarning result = service.save(warning);
        assertNotNull(result);
    }

    @Test
    void deleteById_success() {
        service.deleteById(warningId);
        verify(repository).deleteById(warningId);
    }

    @Test
    void scanAndSendLateWarnings_noLateAssignments_returnsZero() {
        UUID semesterId = UUID.randomUUID();
        when(enterpriseAssignmentRepository.findAssignmentsWithLateReports(semesterId, 3))
                .thenReturn(Collections.emptyList());

        int count = service.scanAndSendLateWarnings(semesterId, 3, null);

        assertEquals(0, count);
        verify(repository, never()).saveAll(any());
        assertNull(mailService.lastTo);
    }

    @Test
    void scanAndSendLateWarnings_hasLateAssignments_processesAndReturnsCount() {
        UUID semesterId = UUID.randomUUID();
        UUID tmId = UUID.randomUUID();

        User student = new User();
        student.setUserId(UUID.randomUUID());
        student.setFullName("Nguyen Van A");
        student.setEmail("nva@example.com");

        EnterpriseAssignment assignment = new EnterpriseAssignment();
        assignment.setAssignmentId(UUID.randomUUID());
        assignment.setStudent(student);

        when(enterpriseAssignmentRepository.findAssignmentsWithLateReports(semesterId, 3))
                .thenReturn(List.of(assignment));

        int count = service.scanAndSendLateWarnings(semesterId, 3, tmId);

        assertEquals(1, count);
        verify(repository).saveAll(argThat(iterable -> {
            if (iterable == null || !iterable.iterator().hasNext()) return false;
            TrainingWarning w = iterable.iterator().next();
            return w.getStudent().getUserId().equals(student.getUserId()) && w.getWeekNumber() == 3;
        }));

        assertEquals("nva@example.com", mailService.lastTo);
        assertEquals("Nguyen Van A", mailService.lastFullName);
        assertEquals(3, mailService.lastWeekNumber);
    }

    @Test
    void scanAndSendLateWarnings_nullTmId_processesSuccessfully() {
        UUID semesterId = UUID.randomUUID();

        User student = new User();
        student.setUserId(UUID.randomUUID());
        student.setFullName("Nguyen Van B");
        student.setEmail("nvb@example.com");

        EnterpriseAssignment assignment = new EnterpriseAssignment();
        assignment.setAssignmentId(UUID.randomUUID());
        assignment.setStudent(student);

        when(enterpriseAssignmentRepository.findAssignmentsWithLateReports(semesterId, 4))
                .thenReturn(List.of(assignment));

        int count = service.scanAndSendLateWarnings(semesterId, 4, null);

        assertEquals(1, count);
        verify(repository).saveAll(any());
        assertEquals("nvb@example.com", mailService.lastTo);
    }

    @Test
    void scanAndSendLateWarnings_emptyOrNullEmail_doesNotSendMail() {
        UUID semesterId = UUID.randomUUID();
        UUID tmId = UUID.randomUUID();

        User student1 = new User();
        student1.setUserId(UUID.randomUUID());
        student1.setFullName("Nguyen Van C");
        student1.setEmail(null);

        User student2 = new User();
        student2.setUserId(UUID.randomUUID());
        student2.setFullName("Nguyen Van D");
        student2.setEmail("");

        EnterpriseAssignment assignment1 = new EnterpriseAssignment();
        assignment1.setAssignmentId(UUID.randomUUID());
        assignment1.setStudent(student1);

        EnterpriseAssignment assignment2 = new EnterpriseAssignment();
        assignment2.setAssignmentId(UUID.randomUUID());
        assignment2.setStudent(student2);

        when(enterpriseAssignmentRepository.findAssignmentsWithLateReports(semesterId, 5))
                .thenReturn(List.of(assignment1, assignment2));

        int count = service.scanAndSendLateWarnings(semesterId, 5, tmId);

        assertEquals(2, count);
        verify(repository).saveAll(any());
        assertNull(mailService.lastTo); // No mail should be sent
    }
}
