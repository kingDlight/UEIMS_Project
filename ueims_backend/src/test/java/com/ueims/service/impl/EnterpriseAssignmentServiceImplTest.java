package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.repository.EnterpriseAssignmentRepository;

@ExtendWith(MockitoExtension.class)
class EnterpriseAssignmentServiceImplTest {

    @Mock
    private EnterpriseAssignmentRepository repository;

    @InjectMocks
    private EnterpriseAssignmentServiceImpl service;

    private EnterpriseAssignment enterpriseAssignment;
    private UUID assignmentId;

    @BeforeEach
    void setUp() {
        assignmentId = UUID.randomUUID();
        enterpriseAssignment = EnterpriseAssignment.builder()
                .assignmentId(assignmentId)
                .status("ACTIVE")
                .build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(enterpriseAssignment));

        List<EnterpriseAssignment> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(assignmentId, result.get(0).getAssignmentId());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(assignmentId)).thenReturn(Optional.of(enterpriseAssignment));

        EnterpriseAssignment result = service.findById(assignmentId);

        assertNotNull(result);
        assertEquals(assignmentId, result.getAssignmentId());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(assignmentId)).thenReturn(Optional.empty());

        EnterpriseAssignment result = service.findById(assignmentId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        when(repository.save(any(EnterpriseAssignment.class))).thenReturn(enterpriseAssignment);

        EnterpriseAssignment result = service.save(enterpriseAssignment);

        assertNotNull(result);
        assertEquals(assignmentId, result.getAssignmentId());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(assignmentId);

        verify(repository).deleteById(assignmentId);
    }
}
