package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.InternshipPlan;
import com.ueims.model.entity.InternshipPlanItem;
import com.ueims.model.entity.Semester;
import com.ueims.repository.InternshipPlanItemRepository;
import com.ueims.repository.InternshipPlanRepository;

@ExtendWith(MockitoExtension.class)
class InternshipPlanItemServiceImplTest {

    @Mock
    private InternshipPlanItemRepository repository;

    @Mock
    private InternshipPlanRepository planRepository;

    @Mock
    private com.ueims.repository.UserRepository userRepository;

    @InjectMocks
    private InternshipPlanItemServiceImpl service;

    private InternshipPlanItem item;
    private InternshipPlan plan;
    private Enterprise enterprise;
    private Semester semester;
    private UUID itemId;
    private UUID planId;

    @BeforeEach
    void setUp() {
        itemId = UUID.randomUUID();
        planId = UUID.randomUUID();

        semester = Semester.builder()
                .startDate(LocalDate.of(2023, 9, 1))
                .endDate(LocalDate.of(2023, 12, 31))
                .build();

        enterprise = Enterprise.builder()
                .enterpriseId(UUID.randomUUID())
                .build();

        plan = InternshipPlan.builder()
                .planId(planId)
                .enterprise(enterprise)
                .semester(semester)
                .build();

        org.springframework.security.core.context.SecurityContextHolder.getContext()
                .setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "admin@test.com", null));

        item = InternshipPlanItem.builder()
                .planItemId(itemId)
                .plan(plan)
                .taskDescription("Test description")
                .targetDate(LocalDate.of(2023, 10, 15))
                .build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(item));

        List<InternshipPlanItem> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(itemId, result.get(0).getPlanItemId());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(itemId)).thenReturn(Optional.of(item));

        InternshipPlanItem result = service.findById(itemId);

        assertNotNull(result);
        assertEquals(itemId, result.getPlanItemId());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(itemId)).thenReturn(Optional.empty());

        InternshipPlanItem result = service.findById(itemId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        when(userRepository.findByEmail("admin@test.com"))
                .thenReturn(Optional.of(com.ueims.model.entity.User.builder()
                        .enterprise(plan.getEnterprise())
                        .build()));
        when(planRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(repository.save(any(InternshipPlanItem.class))).thenReturn(item);

        InternshipPlanItem result = service.save(item);

        assertNotNull(result);
        assertEquals(itemId, result.getPlanItemId());
    }

    @Test
    void savePlanNullThrowsException() {
        item.setPlan(null);

        com.ueims.exception.AppException exception =
                assertThrows(com.ueims.exception.AppException.class, () -> service.save(item));

        assertEquals("This field is required", exception.getMessage());
    }

    @Test
    void savePlanIdNullThrowsException() {
        item.getPlan().setPlanId(null);

        com.ueims.exception.AppException exception =
                assertThrows(com.ueims.exception.AppException.class, () -> service.save(item));

        assertEquals("This field is required", exception.getMessage());
    }

    @Test
    void savePlanNotFoundThrowsException() {
        when(planRepository.findById(planId)).thenReturn(Optional.empty());

        com.ueims.exception.AppException exception =
                assertThrows(com.ueims.exception.AppException.class, () -> service.save(item));

        assertEquals("Plan not found", exception.getMessage());
    }

    @Test
    void saveTargetDateBeforeSemesterThrowsException() {
        item.setTargetDate(LocalDate.of(2023, 8, 31)); // Before start date

        when(userRepository.findByEmail("admin@test.com"))
                .thenReturn(Optional.of(com.ueims.model.entity.User.builder()
                        .enterprise(plan.getEnterprise())
                        .build()));
        when(planRepository.findById(planId)).thenReturn(Optional.of(plan));

        com.ueims.exception.AppException exception =
                assertThrows(com.ueims.exception.AppException.class, () -> service.save(item));

        assertEquals(
                "Target date must be within the semester boundaries (2023-09-01 to 2023-12-31)",
                exception.getMessage());
    }

    @Test
    void saveTargetDateAfterSemesterThrowsException() {
        item.setTargetDate(LocalDate.of(2024, 1, 1)); // After end date

        when(userRepository.findByEmail("admin@test.com"))
                .thenReturn(Optional.of(com.ueims.model.entity.User.builder()
                        .enterprise(plan.getEnterprise())
                        .build()));
        when(planRepository.findById(planId)).thenReturn(Optional.of(plan));

        com.ueims.exception.AppException exception =
                assertThrows(com.ueims.exception.AppException.class, () -> service.save(item));

        assertEquals(
                "Target date must be within the semester boundaries (2023-09-01 to 2023-12-31)",
                exception.getMessage());
    }

    @Test
    void saveTargetDateNullThrowsException() {
        item.setTargetDate(null);

        assertThrows(Exception.class, () -> service.save(item));
    }

    @Test
    void saveUnauthorizedThrowsWhenDifferentEnterprise() {
        Enterprise otherEnterprise =
                Enterprise.builder().enterpriseId(UUID.randomUUID()).build();

        when(userRepository.findByEmail("admin@test.com"))
                .thenReturn(Optional.of(com.ueims.model.entity.User.builder()
                        .enterprise(otherEnterprise)
                        .build()));
        when(planRepository.findById(planId)).thenReturn(Optional.of(plan));

        com.ueims.exception.AppException exception =
                assertThrows(com.ueims.exception.AppException.class, () -> service.save(item));

        assertEquals(com.ueims.exception.ErrorCode.UNAUTHORIZED, exception.getErrorCode());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(itemId);

        verify(repository).deleteById(itemId);
    }
}