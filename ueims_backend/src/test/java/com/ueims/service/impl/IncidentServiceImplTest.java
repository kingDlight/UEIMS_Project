package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ueims.dto.request.IncidentReportRequest;
import com.ueims.dto.request.IncidentRequest;
import com.ueims.dto.request.IncidentResolveRequest;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.Incident;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.IncidentRepository;
import com.ueims.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class IncidentServiceImplTest {

    @Mock
    private IncidentRepository repository;

    @Mock
    private EnterpriseAssignmentRepository assignmentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private IncidentServiceImpl service;

    private UUID incidentId;
    private UUID assignmentId;
    private UUID reportedById;
    private UUID resolvedById;

    private Incident incident;
    private EnterpriseAssignment assignment;
    private User reportedBy;
    private User resolvedBy;

    @BeforeEach
    void setUp() {
        incidentId = UUID.randomUUID();
        assignmentId = UUID.randomUUID();
        reportedById = UUID.randomUUID();
        resolvedById = UUID.randomUUID();

        reportedBy =
                User.builder().userId(reportedById).email("student@test.com").build();
        resolvedBy = User.builder().userId(resolvedById).email("admin@test.com").build();

        assignment = EnterpriseAssignment.builder()
                .assignmentId(assignmentId)
                .student(reportedBy)
                .build();

        incident = Incident.builder()
                .incidentId(incidentId)
                .assignment(assignment)
                .reportedBy(reportedBy)
                .category("TECHNICAL")
                .description("Test description")
                .status("OPEN")
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void findAll_returnsList() {
        when(repository.findAll()).thenReturn(Arrays.asList(incident));
        List<Incident> result = service.findAll();
        assertEquals(1, result.size());
        assertEquals(incidentId, result.get(0).getIncidentId());
        verify(repository).findAll();
    }

    @Test
    void findById_whenExists_returnsIncident() {
        when(repository.findById(incidentId)).thenReturn(Optional.of(incident));
        Incident result = service.findById(incidentId);
        assertNotNull(result);
        assertEquals(incidentId, result.getIncidentId());
    }

    @Test
    void findById_whenNotExists_returnsNull() {
        when(repository.findById(incidentId)).thenReturn(Optional.empty());
        Incident result = service.findById(incidentId);
        assertNull(result);
    }

    @Test
    void save_returnsIncident() {
        when(repository.save(incident)).thenReturn(incident);
        Incident result = service.save(incident);
        assertEquals(incident, result);
        verify(repository).save(incident);
    }

    @Test
    void deleteById_callsRepository() {
        doNothing().when(repository).deleteById(incidentId);
        service.deleteById(incidentId);
        verify(repository).deleteById(incidentId);
    }

    @Test
    void createIncident_whenValidRequest_savesAndReturnsIncident() {
        IncidentRequest request = IncidentRequest.builder()
                .assignmentId(assignmentId)
                .reportedById(reportedById)
                .category("BEHAVIOR")
                .description("Test")
                .build();

        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(userRepository.findById(reportedById)).thenReturn(Optional.of(reportedBy));
        when(repository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident result = service.createIncident(request);

        assertNotNull(result);
        assertEquals("OPEN", result.getStatus());
        assertEquals("BEHAVIOR", result.getCategory());
        assertNull(result.getResolvedBy());
        verify(repository).save(any(Incident.class));
    }

    @Test
    void createIncident_withResolvedUser_savesIncidentWithResolvedAt() {
        IncidentRequest request = IncidentRequest.builder()
                .assignmentId(assignmentId)
                .reportedById(reportedById)
                .resolvedById(resolvedById)
                .status("RESOLVED")
                .build();

        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(userRepository.findById(reportedById)).thenReturn(Optional.of(reportedBy));
        when(userRepository.findById(resolvedById)).thenReturn(Optional.of(resolvedBy));
        when(repository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident result = service.createIncident(request);

        assertEquals(resolvedBy, result.getResolvedBy());
        assertNotNull(result.getResolvedAt());
        assertEquals("RESOLVED", result.getStatus());
    }

    @Test
    void createIncident_whenAssignmentNotFound_throwsException() {
        IncidentRequest request =
                IncidentRequest.builder().assignmentId(assignmentId).build();
        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.createIncident(request));
    }

    @Test
    void updateIncident_whenValid_updatesAndReturns() {
        IncidentRequest request = IncidentRequest.builder()
                .assignmentId(assignmentId)
                .reportedById(reportedById)
                .resolvedById(resolvedById)
                .status("RESOLVED")
                .build();

        when(repository.findById(incidentId)).thenReturn(Optional.of(incident));
        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(userRepository.findById(reportedById)).thenReturn(Optional.of(reportedBy));
        when(userRepository.findById(resolvedById)).thenReturn(Optional.of(resolvedBy));
        when(repository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident result = service.updateIncident(incidentId, request);

        assertEquals("RESOLVED", result.getStatus());
        assertNotNull(result.getResolvedAt());
        assertEquals(resolvedBy, result.getResolvedBy());
    }

    @Test
    void updateIncident_whenIncidentNotFound_throwsException() {
        IncidentRequest request = IncidentRequest.builder().build();
        when(repository.findById(incidentId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.updateIncident(incidentId, request));
    }

    @Test
    void reportIncident_whenUserIsStudent_createsIncident() {
        IncidentReportRequest request = new IncidentReportRequest();
        request.setAssignmentId(assignmentId);
        request.setCategory("TEST");
        request.setDescription("Test desc");

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("student@test.com", null));

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(reportedBy));
        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(repository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident result = service.reportIncident(request);

        assertNotNull(result);
        assertEquals("OPEN", result.getStatus());
        assertEquals(reportedBy, result.getReportedBy());
    }

    @Test
    void reportIncident_whenUserIsEnterprise_createsIncident() {
        UUID enterpriseId = UUID.randomUUID();
        Enterprise enterprise = Enterprise.builder().enterpriseId(enterpriseId).build();
        User enterpriseUser = User.builder()
                .userId(UUID.randomUUID())
                .email("ent@test.com")
                .enterprise(enterprise)
                .build();
        assignment.setEnterprise(enterprise);

        IncidentReportRequest request = new IncidentReportRequest();
        request.setAssignmentId(assignmentId);

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("ent@test.com", null));

        when(userRepository.findByEmail("ent@test.com")).thenReturn(Optional.of(enterpriseUser));
        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(repository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident result = service.reportIncident(request);

        assertNotNull(result);
        assertEquals(enterpriseUser, result.getReportedBy());
    }

    @Test
    void reportIncident_whenUserHasNoPermission_throwsException() {
        User otherUser =
                User.builder().userId(UUID.randomUUID()).email("other@test.com").build();
        IncidentReportRequest request = new IncidentReportRequest();
        request.setAssignmentId(assignmentId);

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("other@test.com", null));

        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherUser));
        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

        assertThrows(IllegalArgumentException.class, () -> service.reportIncident(request));
    }

    @Test
    void resolveIncident_whenValid_resolvesIncident() {
        IncidentResolveRequest request = new IncidentResolveRequest();
        request.setResolutionNote("Fixed");

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("admin@test.com", null));

        when(repository.findById(incidentId)).thenReturn(Optional.of(incident));
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(resolvedBy));
        when(repository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident result = service.resolveIncident(incidentId, request);

        assertEquals("RESOLVED", result.getStatus());
        assertEquals("Fixed", result.getResolutionNote());
        assertEquals(resolvedBy, result.getResolvedBy());
        assertNotNull(result.getResolvedAt());
    }

    @Test
    void resolveIncident_whenAlreadyResolved_throwsException() {
        incident.setStatus("RESOLVED");
        IncidentResolveRequest request = new IncidentResolveRequest();
        request.setResolutionNote("Fixed");

        when(repository.findById(incidentId)).thenReturn(Optional.of(incident));

        assertThrows(IllegalArgumentException.class, () -> service.resolveIncident(incidentId, request));
    }

    @Test
    void resolveIncident_whenNoResolutionNote_throwsException() {
        IncidentResolveRequest request = new IncidentResolveRequest();
        request.setResolutionNote("   ");

        when(repository.findById(incidentId)).thenReturn(Optional.of(incident));

        assertThrows(IllegalArgumentException.class, () -> service.resolveIncident(incidentId, request));
    }
}
