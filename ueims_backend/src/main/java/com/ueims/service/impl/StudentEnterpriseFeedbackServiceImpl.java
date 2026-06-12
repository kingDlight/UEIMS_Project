package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.StudentEnterpriseFeedback;
import com.ueims.model.entity.User;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.StudentEnterpriseFeedbackRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.StudentEnterpriseFeedbackService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StudentEnterpriseFeedbackServiceImpl implements StudentEnterpriseFeedbackService {
    StudentEnterpriseFeedbackRepository repository;
    UserRepository userRepository;
    EligibleStudentRepository eligibleStudentRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    public List<StudentEnterpriseFeedback> findAll() {
        return repository.findAll();
    }

    @Override
    public StudentEnterpriseFeedback findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public StudentEnterpriseFeedback save(StudentEnterpriseFeedback entity) {
        User currentUser = getCurrentUser();

        // Check if student is eligible
        eligibleStudentRepository
                .findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), entity.getSemester().getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE));

        // Enforce ownership
        if (!currentUser.getUserId().equals(entity.getStudent().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Constraint: Single Feedback Per Semester
        boolean exists = repository.existsByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
                currentUser.getUserId(),
                entity.getEnterprise().getEnterpriseId(),
                entity.getSemester().getSemesterId());
        if (exists) {
            throw new AppException(ErrorCode.FEEDBACK_DUPLICATE);
        }

        // Constraint: Feedback Rating Scale 1-5
        if (isInvalidScore(entity.getTrainingQualityScore())
                || isInvalidScore(entity.getSupervisorSupportScore())
                || isInvalidScore(entity.getWorkEnvironmentScore())
                || isInvalidScore(entity.getOverallScore())) {
            throw new AppException(ErrorCode.FEEDBACK_RATING_INVALID);
        }

        return repository.save(entity);
    }

    private boolean isInvalidScore(Integer score) {
        return score == null || score < 1 || score > 5;
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
