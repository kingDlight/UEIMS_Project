package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.dto.request.BroadcastNotificationRequest;
import com.ueims.exception.ResourceNotFoundException;
import com.ueims.model.entity.*;
import com.ueims.repository.NotificationRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.websocket.NotificationBroadcaster;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository repository;

    @Mock
    private UserRepository userRepository;

    private NotificationBroadcaster broadcaster;
    private int pushToUserCalled = 0;
    private int pushUnreadCalled = 0;

    @InjectMocks
    private NotificationServiceImpl service;

    private User student;
    private User tm;
    private Notification notification;

    @BeforeEach
    void setUp() {
        student = new User();
        student.setUserId(UUID.randomUUID());
        student.setEmail("student@fpt.edu.vn");
        student.setStatus("ACTIVE");

        tm = new User();
        tm.setUserId(UUID.randomUUID());
        tm.setEmail("tm@fpt.edu.vn");
        tm.setStatus("ACTIVE");

        Role tmRole = new Role();
        tmRole.setRoleName("TRAINING_MANAGER");
        UserRole userRole = new UserRole();
        userRole.setRole(tmRole);
        tm.setRoles(Set.of(userRole));

        notification = new Notification();
        notification.setNotificationId(UUID.randomUUID());
        notification.setRecipient(student);
        notification.setIsRead(false);

        pushToUserCalled = 0;
        pushUnreadCalled = 0;
        broadcaster = new NotificationBroadcaster(null, null) {
            @Override
            public void pushToUser(String userEmail, Notification notification) {
                pushToUserCalled++;
            }

            @Override
            public void pushUnreadCountToUser(String userEmail, long unread) {
                pushUnreadCalled++;
            }
        };
        service = new NotificationServiceImpl(repository, userRepository, broadcaster);
    }

    @Test
    void crud_Methods_CallRepository() {
        when(repository.findAll()).thenReturn(List.of(notification));
        assertEquals(1, service.findAll().size());

        when(repository.findById(notification.getNotificationId())).thenReturn(Optional.of(notification));
        assertNotNull(service.findById(notification.getNotificationId()));

        when(repository.save(notification)).thenReturn(notification);
        assertEquals(notification, service.save(notification));

        doNothing().when(repository).deleteById(notification.getNotificationId());
        assertDoesNotThrow(() -> service.deleteById(notification.getNotificationId()));
    }

    @Test
    void getMyNotifications_ReturnsList() {
        when(repository.findByRecipient_EmailOrderByCreatedAtDesc("student@fpt.edu.vn"))
                .thenReturn(List.of(notification));
        assertEquals(1, service.getMyNotifications("student@fpt.edu.vn").size());
    }

    @Test
    void countUnreadForEmail_ReturnsCount() {
        when(repository.countByRecipient_EmailAndIsReadFalse("student@fpt.edu.vn"))
                .thenReturn(5L);
        assertEquals(5L, service.countUnreadForEmail("student@fpt.edu.vn"));
    }

    @Test
    void broadcast_ThrowsExceptionIfInvalid() {
        assertThrows(IllegalArgumentException.class, () -> service.broadcast(null));

        BroadcastNotificationRequest req1 = new BroadcastNotificationRequest();
        assertThrows(IllegalArgumentException.class, () -> service.broadcast(req1));

        req1.setTitle("Title");
        assertThrows(IllegalArgumentException.class, () -> service.broadcast(req1));
    }

    @Test
    void broadcast_WithExplicitRecipients_Success() {
        BroadcastNotificationRequest req = new BroadcastNotificationRequest();
        req.setTitle("Hello");
        req.setMessage("Test Message");
        req.setRecipientIds(List.of(student.getUserId()));

        when(userRepository.findById(student.getUserId())).thenReturn(Optional.of(student));
        when(repository.save(any(Notification.class))).thenReturn(notification);

        int sent = service.broadcast(req);

        assertEquals(1, sent);
        verify(repository, times(1)).save(any(Notification.class));
        assertEquals(1, pushToUserCalled);
    }

    @Test
    void broadcast_WithTargetRole_Success() {
        BroadcastNotificationRequest req = new BroadcastNotificationRequest();
        req.setTitle("Hello");
        req.setMessage("Test Message");
        req.setTargetRole("STUDENT");

        when(userRepository.findActiveUsersByRoleName("STUDENT")).thenReturn(List.of(student));
        when(userRepository.findById(student.getUserId())).thenReturn(Optional.of(student));
        when(repository.save(any(Notification.class))).thenReturn(notification);

        int sent = service.broadcast(req);

        assertEquals(1, sent);
        verify(userRepository).findActiveUsersByRoleName("STUDENT");
    }

    @Test
    void broadcast_SaveFails_Continues() {
        BroadcastNotificationRequest req = new BroadcastNotificationRequest();
        req.setTitle("Hello");
        req.setMessage("Test Message");
        req.setRecipientIds(List.of(student.getUserId(), tm.getUserId()));

        when(userRepository.findById(student.getUserId())).thenReturn(Optional.of(student));
        when(userRepository.findById(tm.getUserId())).thenReturn(Optional.of(tm));

        // Throw for first, succeed for second
        when(repository.save(any(Notification.class)))
                .thenThrow(new RuntimeException("DB Error"))
                .thenReturn(notification);

        int sent = service.broadcast(req);

        assertEquals(1, sent); // 1 success out of 2
    }

    @Test
    void markAsRead_NotFound_Throws() {
        when(repository.findByNotificationIdAndRecipient_Email(any(), anyString()))
                .thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.markAsRead(UUID.randomUUID(), "test"));
    }

    @Test
    void markAsRead_AlreadyRead_ReturnsImmediately() {
        notification.setIsRead(true);
        when(repository.findByNotificationIdAndRecipient_Email(notification.getNotificationId(), "student@fpt.edu.vn"))
                .thenReturn(Optional.of(notification));

        Notification result = service.markAsRead(notification.getNotificationId(), "student@fpt.edu.vn");

        assertTrue(result.getIsRead());
        verify(repository, never()).save(any());
    }

    @Test
    void markAsRead_Success() {
        when(repository.findByNotificationIdAndRecipient_Email(notification.getNotificationId(), "student@fpt.edu.vn"))
                .thenReturn(Optional.of(notification));
        when(repository.save(any())).thenReturn(notification);
        when(repository.countByRecipient_EmailAndIsReadFalse("student@fpt.edu.vn"))
                .thenReturn(0L);

        Notification result = service.markAsRead(notification.getNotificationId(), "student@fpt.edu.vn");

        assertTrue(result.getIsRead());
        assertEquals(1, pushUnreadCalled);
    }

    @Test
    void markAllAsRead_Success() {
        when(repository.markAllAsReadForRecipient("student@fpt.edu.vn")).thenReturn(5);

        int updated = service.markAllAsRead("student@fpt.edu.vn");

        assertEquals(5, updated);
        assertEquals(1, pushUnreadCalled);
    }

    @Test
    void notifyInterview_Scheduled() {
        Interview interview = createMockInterview();
        when(userRepository.findById(student.getUserId())).thenReturn(Optional.of(student));
        when(repository.save(any())).thenReturn(notification);

        service.notifyInterviewScheduled(interview);

        verify(repository).save(argThat(n -> "INTERVIEW_SCHEDULED".equals(n.getType())));
    }

    @Test
    void notifyInterview_Result() {
        Interview interview = createMockInterview();
        interview.setResult("PASS");
        when(userRepository.findById(student.getUserId())).thenReturn(Optional.of(student));
        when(repository.save(any())).thenReturn(notification);

        service.notifyInterviewResult(interview);

        verify(repository).save(argThat(n -> n.getTitle().contains("ĐẬU")));
    }

    @Test
    void notifyWeeklyReport_Approved() {
        WeeklyReport report = createMockWeeklyReport();
        when(userRepository.findById(student.getUserId())).thenReturn(Optional.of(student));
        when(repository.save(any())).thenReturn(notification);

        service.notifyWeeklyReportApproved(report);

        verify(repository).save(argThat(n -> "WEEKLY_REPORT_APPROVED".equals(n.getType())));
    }

    @Test
    void notifyWeeklyReport_Rejected() {
        WeeklyReport report = createMockWeeklyReport();
        when(userRepository.findById(student.getUserId())).thenReturn(Optional.of(student));
        when(repository.save(any())).thenReturn(notification);

        service.notifyWeeklyReportRejected(report, "Bad content");

        verify(repository)
                .save(argThat(n -> "WEEKLY_REPORT_REJECTED".equals(n.getType())
                        && n.getMessage().contains("Bad content")));
    }

    @Test
    void notifyTrainingManagerOfIncident() {
        Incident incident = new Incident();
        incident.setCategory("Violation");

        when(userRepository.findAll()).thenReturn(List.of(student, tm)); // student is not TM, tm is TM
        when(repository.save(any())).thenReturn(notification);

        service.notifyTrainingManagerOfIncident(incident);

        // Should only send to TM
        verify(repository, times(1)).save(any());
    }

    private Interview createMockInterview() {
        Application app = new Application();
        app.setStudent(student);
        Interview interview = new Interview();
        interview.setInterviewId(UUID.randomUUID());
        interview.setApplication(app);
        return interview;
    }

    private WeeklyReport createMockWeeklyReport() {
        EnterpriseAssignment assignment = new EnterpriseAssignment();
        assignment.setStudent(student);
        WeeklyReport report = new WeeklyReport();
        report.setAssignment(assignment);
        return report;
    }
}
