package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.StudentEnterpriseFeedback;
import com.ueims.model.entity.User;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.StudentEnterpriseFeedbackRepository;
import com.ueims.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class StudentEnterpriseFeedbackServiceImplTest {

    private static final String TEST_EMAIL = "student@test.com";

    @Mock
    private StudentEnterpriseFeedbackRepository repository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EligibleStudentRepository eligibleStudentRepository;

    @InjectMocks
    private StudentEnterpriseFeedbackServiceImpl service;

    private StudentEnterpriseFeedback feedback;
    private User student;
    private UUID feedbackId;
    private UUID studentId;
    private UUID enterpriseId;
    private UUID semesterId;

    @BeforeEach
    void setUp() {
        feedbackId = UUID.randomUUID();
        studentId = UUID.randomUUID();
        enterpriseId = UUID.randomUUID();
        semesterId = UUID.randomUUID();

        student = User.builder().userId(studentId).email(TEST_EMAIL).build();
        Enterprise enterprise = Enterprise.builder().enterpriseId(enterpriseId).build();
        Semester semester = Semester.builder().semesterId(semesterId).build();

        feedback = StudentEnterpriseFeedback.builder()
                .feedbackId(feedbackId)
                .student(student)
                .enterprise(enterprise)
                .semester(semester)
                .trainingQualityScore(5)
                .supervisorSupportScore(4)
                .workEnvironmentScore(5)
                .overallScore(4)
                .build();
    }

    private void mockSecurityContext() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(TEST_EMAIL, null));
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(student));
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(feedback));

        List<StudentEnterpriseFeedback> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(feedbackId, result.get(0).getFeedbackId());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(feedbackId)).thenReturn(Optional.of(feedback));

        StudentEnterpriseFeedback result = service.findById(feedbackId);

        assertNotNull(result);
        assertEquals(feedbackId, result.getFeedbackId());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(feedbackId)).thenReturn(Optional.empty());

        StudentEnterpriseFeedback result = service.findById(feedbackId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        mockSecurityContext();
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(studentId, semesterId))
                .thenReturn(Optional.of(new EligibleStudent()));
        when(repository.existsByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
                        studentId, enterpriseId, semesterId))
                .thenReturn(false);
        when(repository.save(any(StudentEnterpriseFeedback.class))).thenReturn(feedback);

        StudentEnterpriseFeedback result = service.save(feedback);

        assertNotNull(result);
        assertEquals(feedbackId, result.getFeedbackId());
    }

    @Test
    void saveUserNotFoundThrowsException() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(TEST_EMAIL, null));
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> service.save(feedback));

        assertEquals(ErrorCode.USER_NOT_EXISTED, exception.getErrorCode());
    }

    @Test
    void saveStudentNotEligibleThrowsException() {
        mockSecurityContext();
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(studentId, semesterId))
                .thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> service.save(feedback));

        assertEquals(ErrorCode.STUDENT_NOT_ELIGIBLE, exception.getErrorCode());
    }

    @Test
    void saveUnauthorizedThrowsException() {
        mockSecurityContext();
        User anotherUser = User.builder().userId(UUID.randomUUID()).build();
        feedback.setStudent(anotherUser);

        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(studentId, semesterId))
                .thenReturn(Optional.of(new EligibleStudent()));

        AppException exception = assertThrows(AppException.class, () -> service.save(feedback));

        assertEquals(ErrorCode.UNAUTHORIZED, exception.getErrorCode());
    }

    @Test
    void saveDuplicateFeedbackThrowsException() {
        mockSecurityContext();
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(studentId, semesterId))
                .thenReturn(Optional.of(new EligibleStudent()));
        when(repository.existsByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
                        studentId, enterpriseId, semesterId))
                .thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> service.save(feedback));

        assertEquals(ErrorCode.FEEDBACK_DUPLICATE, exception.getErrorCode());
    }

    @Test
    void saveInvalidScoreThrowsException() {
        mockSecurityContext();
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(studentId, semesterId))
                .thenReturn(Optional.of(new EligibleStudent()));
        when(repository.existsByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
                        studentId, enterpriseId, semesterId))
                .thenReturn(false);

        feedback.setTrainingQualityScore(6); // Invalid score

        AppException exception = assertThrows(AppException.class, () -> service.save(feedback));

        assertEquals(ErrorCode.FEEDBACK_RATING_INVALID, exception.getErrorCode());
    }

    @Test
    void saveNullScoreThrowsException() {
        mockSecurityContext();
        when(eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(studentId, semesterId))
                .thenReturn(Optional.of(new EligibleStudent()));
        when(repository.existsByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
                        studentId, enterpriseId, semesterId))
                .thenReturn(false);

        feedback.setTrainingQualityScore(null); // Invalid score

        AppException exception = assertThrows(AppException.class, () -> service.save(feedback));

        assertEquals(ErrorCode.FEEDBACK_RATING_INVALID, exception.getErrorCode());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(feedbackId);

        verify(repository).deleteById(feedbackId);
    }
}
