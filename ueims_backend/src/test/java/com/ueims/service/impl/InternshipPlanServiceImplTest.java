package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.dto.response.InternshipPlanDTO;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.InternshipPlan;
import com.ueims.model.entity.Semester;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.InternshipPlanItemRepository;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class InternshipPlanServiceImplTest {

    @Mock
    private InternshipPlanRepository repository;

    @Mock
    private InternshipPlanItemRepository itemRepository;

    @Mock
    private EnterpriseRepository enterpriseRepository;

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private JobPostRepository jobPostRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InternshipPlanServiceImpl service;

    @Test
    void findAllSuccess() {
        InternshipPlan plan = InternshipPlan.builder().planId(UUID.randomUUID()).build();
        when(repository.findAll()).thenReturn(List.of(plan));

        List<InternshipPlan> result = service.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void findByIdSuccess() {
        UUID planId = UUID.randomUUID();
        InternshipPlan plan = InternshipPlan.builder().planId(planId).build();
        when(repository.findById(planId)).thenReturn(Optional.of(plan));

        InternshipPlan result = service.findById(planId);

        assertNotNull(result);
        assertEquals(planId, result.getPlanId());
    }

    @Test
    void findByIdNotFound() {
        UUID planId = UUID.randomUUID();
        when(repository.findById(planId)).thenReturn(Optional.empty());

        InternshipPlan result = service.findById(planId);

        assertNull(result);
    }

    @Test
    void findByEnterpriseAndSemesterSuccess() {
        UUID enterpriseId = UUID.randomUUID();
        UUID semesterId = UUID.randomUUID();
        InternshipPlan plan = InternshipPlan.builder().planId(UUID.randomUUID()).build();
        when(repository.findByEnterprise_EnterpriseIdAndSemester_SemesterId(enterpriseId, semesterId))
                .thenReturn(Optional.of(plan));
        when(itemRepository.findByPlan_PlanId(plan.getPlanId())).thenReturn(List.of());

        InternshipPlan result = service.findByEnterpriseAndSemester(enterpriseId, semesterId);

        assertNotNull(result);
        assertNotNull(result.getItems());
    }

    @Test
    void findMyPlanReturnsApprovedPlanMatchingActiveAssignment() {
        UUID studentId = UUID.randomUUID();
        InternshipPlan plan = InternshipPlan.builder().planId(UUID.randomUUID()).build();
        when(repository.findActivePlanForStudent(studentId)).thenReturn(Optional.of(plan));
        when(itemRepository.findByPlan_PlanId(plan.getPlanId())).thenReturn(List.of());

        InternshipPlan result = service.findMyPlan(studentId);

        assertNotNull(result);
        assertEquals(plan.getPlanId(), result.getPlanId());
    }

    @Test
    void findMyPlanReturnsNullWhenNoActivePlan() {
        UUID studentId = UUID.randomUUID();
        when(repository.findActivePlanForStudent(studentId)).thenReturn(Optional.empty());

        InternshipPlan result = service.findMyPlan(studentId);

        assertNull(result);
    }

    @Test
    void upsertPlan_createsNewWhenNoneExists() {
        UUID enterpriseId = UUID.randomUUID();
        UUID semesterId = UUID.randomUUID();
        Enterprise enterprise = Enterprise.builder().enterpriseId(enterpriseId).build();
        Semester semester =
                Semester.builder().semesterId(semesterId).status("ACTIVE").build();

        when(enterpriseRepository.findById(enterpriseId)).thenReturn(Optional.of(enterprise));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(repository.findByEnterprise_EnterpriseIdAndSemester_SemesterId(enterpriseId, semesterId))
                .thenReturn(Optional.empty());
        when(repository.save(any(InternshipPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        InternshipPlanDTO dto = InternshipPlanDTO.builder()
                .semesterId(semesterId)
                .overallGoal("Test goal")
                .build();

        InternshipPlan result = service.upsertPlan(dto, enterpriseId);

        assertNotNull(result);
        assertEquals("PENDING_APPROVAL", result.getStatus());
        assertEquals("Test goal", result.getOverallGoal());
    }

    @Test
    void upsertPlan_rejectsModifyingApprovedPlan() {
        UUID enterpriseId = UUID.randomUUID();
        UUID semesterId = UUID.randomUUID();
        Enterprise enterprise = Enterprise.builder().enterpriseId(enterpriseId).build();
        Semester semester =
                Semester.builder().semesterId(semesterId).status("ACTIVE").build();
        InternshipPlan existing = InternshipPlan.builder()
                .planId(UUID.randomUUID())
                .enterprise(enterprise)
                .semester(semester)
                .status("APPROVED")
                .build();

        when(enterpriseRepository.findById(enterpriseId)).thenReturn(Optional.of(enterprise));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(repository.findByEnterprise_EnterpriseIdAndSemester_SemesterId(enterpriseId, semesterId))
                .thenReturn(Optional.of(existing));

        InternshipPlanDTO dto = InternshipPlanDTO.builder()
                .semesterId(semesterId)
                .overallGoal("Trying to modify")
                .build();

        com.ueims.exception.AppException e = org.junit.jupiter.api.Assertions.assertThrows(
                com.ueims.exception.AppException.class, () -> service.upsertPlan(dto, enterpriseId));
        assertEquals(com.ueims.exception.ErrorCode.RESOURCE_INVALID_STATE, e.getErrorCode());
    }

    @Test
    void upsertPlan_resubmitsRejectedPlan() {
        UUID enterpriseId = UUID.randomUUID();
        UUID semesterId = UUID.randomUUID();
        Enterprise enterprise = Enterprise.builder().enterpriseId(enterpriseId).build();
        Semester semester =
                Semester.builder().semesterId(semesterId).status("ACTIVE").build();
        InternshipPlan rejected = InternshipPlan.builder()
                .planId(UUID.randomUUID())
                .enterprise(enterprise)
                .semester(semester)
                .status("REJECTED")
                .rejectionReason("Incomplete")
                .build();

        when(enterpriseRepository.findById(enterpriseId)).thenReturn(Optional.of(enterprise));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(repository.findByEnterprise_EnterpriseIdAndSemester_SemesterId(enterpriseId, semesterId))
                .thenReturn(Optional.of(rejected));
        when(repository.save(any(InternshipPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        InternshipPlanDTO dto = InternshipPlanDTO.builder()
                .semesterId(semesterId)
                .overallGoal("Updated goal")
                .build();

        InternshipPlan result = service.upsertPlan(dto, enterpriseId);

        assertEquals("PENDING_APPROVAL", result.getStatus());
        assertNull(result.getRejectionReason());
        assertEquals("Updated goal", result.getOverallGoal());
    }

    @Test
    void upsertPlan_blocksOnLockedSemester() {
        UUID enterpriseId = UUID.randomUUID();
        UUID semesterId = UUID.randomUUID();
        Enterprise enterprise = Enterprise.builder().enterpriseId(enterpriseId).build();
        Semester semester =
                Semester.builder().semesterId(semesterId).status("LOCKED").build();

        when(enterpriseRepository.findById(enterpriseId)).thenReturn(Optional.of(enterprise));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));

        InternshipPlanDTO dto = InternshipPlanDTO.builder()
                .semesterId(semesterId)
                .overallGoal("Test")
                .build();

        com.ueims.exception.AppException e = org.junit.jupiter.api.Assertions.assertThrows(
                com.ueims.exception.AppException.class, () -> service.upsertPlan(dto, enterpriseId));
        assertEquals(com.ueims.exception.ErrorCode.SEMESTER_LOCKED_DATE, e.getErrorCode());
    }

    @Test
    void approvePlan_changesStatusToApproved() {
        UUID planId = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();
        com.ueims.model.entity.User reviewer =
                com.ueims.model.entity.User.builder().userId(reviewerId).build();
        Semester semester =
                Semester.builder().semesterId(UUID.randomUUID()).status("ACTIVE").build();
        InternshipPlan plan = InternshipPlan.builder()
                .planId(planId)
                .semester(semester)
                .status("PENDING_APPROVAL")
                .build();

        when(repository.findById(planId)).thenReturn(Optional.of(plan));
        when(userRepository.findById(reviewerId)).thenReturn(Optional.of(reviewer));
        when(repository.save(any(InternshipPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        InternshipPlan result = service.approveMasterPlan(planId, reviewerId);

        assertEquals("APPROVED", result.getStatus());
        assertNotNull(result.getApprovedAt());
    }

    @Test
    void rejectPlan_requiresReason() {
        UUID planId = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();

        com.ueims.exception.AppException e = org.junit.jupiter.api.Assertions.assertThrows(
                com.ueims.exception.AppException.class,
                () -> service.rejectMasterPlan(planId, reviewerId, ""));
        assertEquals(com.ueims.exception.ErrorCode.REJECTION_REASON_REQUIRED, e.getErrorCode());
    }

    @Test
    void rejectPlan_changesStatusToRejected() {
        UUID planId = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();
        com.ueims.model.entity.User reviewer =
                com.ueims.model.entity.User.builder().userId(reviewerId).build();
        Semester semester =
                Semester.builder().semesterId(UUID.randomUUID()).status("ACTIVE").build();
        InternshipPlan plan = InternshipPlan.builder()
                .planId(planId)
                .semester(semester)
                .status("PENDING_APPROVAL")
                .build();

        when(repository.findById(planId)).thenReturn(Optional.of(plan));
        when(userRepository.findById(reviewerId)).thenReturn(Optional.of(reviewer));
        when(repository.save(any(InternshipPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        InternshipPlan result = service.rejectMasterPlan(planId, reviewerId, "Goals too vague");

        assertEquals("REJECTED", result.getStatus());
        assertEquals("Goals too vague", result.getRejectionReason());
    }
}