package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
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

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.*;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.EnterpriseEvaluationRepository;
import com.ueims.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class EnterpriseEvaluationServiceImplTest {

    @Mock
    private EnterpriseEvaluationRepository repository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EnterpriseAssignmentRepository assignmentRepository;

    @Mock
    private EligibleStudentRepository eligibleStudentRepository;

    @InjectMocks
    private EnterpriseEvaluationServiceImpl service;

    private User currentUser;
    private Enterprise enterprise;
    private EnterpriseAssignment assignment;
    private EnterpriseEvaluation evaluation;
    private Semester semester;
    private User studentUser;

    @BeforeEach
    void setUp() {
        enterprise = new Enterprise();
        enterprise.setEnterpriseId(UUID.randomUUID());
        enterprise.setStatus("APPROVED");

        currentUser = new User();
        currentUser.setUserId(UUID.randomUUID());
        currentUser.setEmail("enterprise@test.com");
        currentUser.setEnterprise(enterprise);
        currentUser.setRoles(java.util.Collections.emptySet());

        semester = new Semester();
        semester.setSemesterId(UUID.randomUUID());
        semester.setStatus("ACTIVE");

        studentUser = new User();
        studentUser.setUserId(UUID.randomUUID());
        studentUser.setStatus("OJT");
        studentUser.setEmail("student@test.com");
        studentUser.setRoles(java.util.Collections.emptySet());

        assignment = new EnterpriseAssignment();
        assignment.setAssignmentId(UUID.randomUUID());
        assignment.setEnterprise(enterprise);
        assignment.setSemester(semester);
        assignment.setStudent(studentUser);

        evaluation = new EnterpriseEvaluation();
        evaluation.setEvaluationId(UUID.randomUUID());
        evaluation.setAssignment(assignment);
        evaluation.setAttitudeScore(new BigDecimal("8.0"));
        evaluation.setProfessionalismScore(new BigDecimal("8.0"));
        evaluation.setSoftSkillsScore(new BigDecimal("8.0"));
        evaluation.setProgressScore(new BigDecimal("8.0"));

        EligibleStudent eligible = new EligibleStudent();
        eligible.setCurrentSemester(7);
        eligible.setStatus("OJT");
        lenient()
                .when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        studentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(eligible));
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext(User user) {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(user.getEmail(), null));
        lenient().when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    @Test
    void findAll_success() {
        when(repository.findAll()).thenReturn(List.of(evaluation));
        List<EnterpriseEvaluation> list = service.findAll();
        assertEquals(1, list.size());
    }

    @Test
    void findById_success_enterpriseAccess() {
        mockSecurityContext(currentUser);
        when(repository.findById(evaluation.getEvaluationId())).thenReturn(Optional.of(evaluation));

        EnterpriseEvaluation result = service.findById(evaluation.getEvaluationId());
        assertNotNull(result);
    }

    @Test
    void findById_success_staffAccess() {
        User staff = new User();
        staff.setUserId(UUID.randomUUID());
        staff.setEmail("staff@test.com");
        Role staffRole = new Role();
        staffRole.setRoleName("TRAINING_MANAGER");
        UserRole userRole = new UserRole();
        userRole.setRole(staffRole);
        staff.setRoles(java.util.Collections.singleton(userRole));

        mockSecurityContext(staff);
        when(repository.findById(evaluation.getEvaluationId())).thenReturn(Optional.of(evaluation));

        EnterpriseEvaluation result = service.findById(evaluation.getEvaluationId());
        assertNotNull(result);
    }

    @Test
    void findById_success_studentAccess() {
        mockSecurityContext(studentUser);
        when(repository.findById(evaluation.getEvaluationId())).thenReturn(Optional.of(evaluation));

        EligibleStudent eligible = new EligibleStudent();
        eligible.setCurrentSemester(7);
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        studentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(eligible));

        EnterpriseEvaluation result = service.findById(evaluation.getEvaluationId());
        assertNotNull(result);
    }

    @Test
    void findById_unauthorized_enterprise() {
        User otherEnterpriseUser = new User();
        otherEnterpriseUser.setEmail("other@test.com");
        otherEnterpriseUser.setUserId(UUID.randomUUID());
        Enterprise otherEnterprise = new Enterprise();
        otherEnterprise.setEnterpriseId(UUID.randomUUID());
        otherEnterpriseUser.setEnterprise(otherEnterprise);
        otherEnterpriseUser.setRoles(java.util.Collections.emptySet());

        mockSecurityContext(otherEnterpriseUser);
        when(repository.findById(evaluation.getEvaluationId())).thenReturn(Optional.of(evaluation));

        UUID id = evaluation.getEvaluationId();
        AppException e = assertThrows(AppException.class, () -> service.findById(id));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void findById_unauthorized_studentNotOwner() {
        User otherStudent = new User();
        otherStudent.setEmail("otherstu@test.com");
        otherStudent.setUserId(UUID.randomUUID());
        otherStudent.setRoles(java.util.Collections.emptySet());

        mockSecurityContext(otherStudent);
        when(repository.findById(evaluation.getEvaluationId())).thenReturn(Optional.of(evaluation));

        UUID id = evaluation.getEvaluationId();
        AppException e = assertThrows(AppException.class, () -> service.findById(id));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void findById_studentAccessDenied_earlySemester() {
        mockSecurityContext(studentUser);
        when(repository.findById(evaluation.getEvaluationId())).thenReturn(Optional.of(evaluation));

        EligibleStudent eligible = new EligibleStudent();
        eligible.setCurrentSemester(6); // Must be >= 7
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        studentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(eligible));

        UUID id = evaluation.getEvaluationId();
        AppException e = assertThrows(AppException.class, () -> service.findById(id));
        assertEquals(ErrorCode.STUDENT_RESULT_ACCESS_DENIED, e.getErrorCode());
    }

    @Test
    void findById_notFound() {
        when(repository.findById(any())).thenReturn(Optional.empty());
        UUID randomId = UUID.randomUUID();
        AppException e = assertThrows(AppException.class, () -> service.findById(randomId));
        assertEquals(ErrorCode.EVALUATION_NOT_FOUND, e.getErrorCode());
    }

    @Test
    void save_success() {
        mockSecurityContext(currentUser);
        when(assignmentRepository.findById(assignment.getAssignmentId())).thenReturn(Optional.of(assignment));
        when(repository.findByAssignment_AssignmentId(assignment.getAssignmentId()))
                .thenReturn(Optional.empty());
        when(repository.save(any(EnterpriseEvaluation.class))).thenAnswer(i -> i.getArgument(0));

        EnterpriseEvaluation saved = service.save(evaluation);
        assertNotNull(saved);
        assertTrue(saved.getIsLocked());
        assertNotNull(saved.getTotalScore());
        // 8.0 * 0.2 + 8.0 * 0.4 + 8.0 * 0.2 + 8.0 * 0.2 = 1.6 + 3.2 + 1.6 + 1.6 = 8.0
        assertEquals(new BigDecimal("8.0"), saved.getTotalScore());
    }

    @Test
    void save_missingAssignment() {
        evaluation.setAssignment(null);
        AppException e = assertThrows(AppException.class, () -> service.save(evaluation));
        assertEquals(ErrorCode.FIELD_REQUIRED, e.getErrorCode());
    }

    @Test
    void save_missingCriteria() {
        evaluation.setAttitudeScore(null);
        AppException e = assertThrows(AppException.class, () -> service.save(evaluation));
        assertEquals(ErrorCode.MISSING_EVALUATION_CRITERIA, e.getErrorCode());
    }

    @Test
    void save_invalidScore() {
        evaluation.setAttitudeScore(new BigDecimal("11.0"));
        AppException e = assertThrows(AppException.class, () -> service.save(evaluation));
        assertEquals(ErrorCode.INVALID_SCORE_RANGE, e.getErrorCode());
    }

    @Test
    void save_semesterLocked() {
        semester.setStatus("LOCKED");
        when(assignmentRepository.findById(assignment.getAssignmentId())).thenReturn(Optional.of(assignment));

        AppException e = assertThrows(AppException.class, () -> service.save(evaluation));
        assertEquals(ErrorCode.SEMESTER_LOCKED_DATE, e.getErrorCode());
    }

    @Test
    void save_studentNotOJT() {
        EligibleStudent notOjt = new EligibleStudent();
        notOjt.setCurrentSemester(7);
        notOjt.setStatus("FAILED");
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                        studentUser.getUserId(), semester.getSemesterId()))
                .thenReturn(Optional.of(notOjt));

        when(assignmentRepository.findById(assignment.getAssignmentId())).thenReturn(Optional.of(assignment));

        AppException e = assertThrows(AppException.class, () -> service.save(evaluation));
        assertEquals(ErrorCode.INVALID_STATUS_FOR_OJT, e.getErrorCode());
    }

    @Test
    void save_unauthorizedEnterprise() {
        User otherEnterpriseUser = new User();
        otherEnterpriseUser.setEmail("other@test.com");
        otherEnterpriseUser.setUserId(UUID.randomUUID());
        Enterprise otherEnterprise = new Enterprise();
        otherEnterprise.setEnterpriseId(UUID.randomUUID());
        otherEnterprise.setStatus("APPROVED");
        otherEnterpriseUser.setEnterprise(otherEnterprise);
        otherEnterpriseUser.setRoles(java.util.Collections.emptySet());

        mockSecurityContext(otherEnterpriseUser);
        when(assignmentRepository.findById(assignment.getAssignmentId())).thenReturn(Optional.of(assignment));

        AppException e = assertThrows(AppException.class, () -> service.save(evaluation));
        assertEquals(ErrorCode.UNAUTHORIZED, e.getErrorCode());
    }

    @Test
    void save_evaluationAlreadyLocked() {
        mockSecurityContext(currentUser);
        when(assignmentRepository.findById(assignment.getAssignmentId())).thenReturn(Optional.of(assignment));

        EnterpriseEvaluation existing = new EnterpriseEvaluation();
        existing.setIsLocked(true);
        when(repository.findByAssignment_AssignmentId(assignment.getAssignmentId()))
                .thenReturn(Optional.of(existing));

        AppException e = assertThrows(AppException.class, () -> service.save(evaluation));
        assertEquals(ErrorCode.EVALUATION_LOCKED, e.getErrorCode());
    }

    @Test
    void deleteById_success() {
        service.deleteById(UUID.randomUUID());
        verify(repository).deleteById(any());
    }
}
