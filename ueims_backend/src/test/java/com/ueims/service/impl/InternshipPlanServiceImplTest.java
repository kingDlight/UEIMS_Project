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

import com.ueims.model.entity.InternshipPlan;
import com.ueims.repository.InternshipPlanRepository;

@ExtendWith(MockitoExtension.class)
class InternshipPlanServiceImplTest {

    @Mock
    private InternshipPlanRepository repository;

    @InjectMocks
    private InternshipPlanServiceImpl service;

    private InternshipPlan internshipPlan;
    private UUID planId;

    @BeforeEach
    void setUp() {
        planId = UUID.randomUUID();
        internshipPlan = InternshipPlan.builder()
                .planId(planId)
                .overallGoal("To learn a lot")
                .isLocked(false)
                .build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(internshipPlan));

        List<InternshipPlan> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(planId, result.get(0).getPlanId());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(planId)).thenReturn(Optional.of(internshipPlan));

        InternshipPlan result = service.findById(planId);

        assertNotNull(result);
        assertEquals(planId, result.getPlanId());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(planId)).thenReturn(Optional.empty());

        InternshipPlan result = service.findById(planId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        when(repository.save(any(InternshipPlan.class))).thenReturn(internshipPlan);

        InternshipPlan result = service.save(internshipPlan);

        assertNotNull(result);
        assertEquals(planId, result.getPlanId());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(planId);

        verify(repository).deleteById(planId);
    }
}
