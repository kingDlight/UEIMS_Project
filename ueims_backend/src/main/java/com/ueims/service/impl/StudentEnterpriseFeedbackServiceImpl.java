package com.ueims.service.impl;

import java.io.FileWriter;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    private static final String DEBUG_LOG =
            "F:/Software Development Project/SWP_Project/UEIMS_Project/debug-feedback.log";

    private void debugLog(String msg) {
        try {
            Path p = Paths.get(DEBUG_LOG);
            Files.createDirectories(p.getParent());
            try (PrintWriter pw = new PrintWriter(new FileWriter(p.toFile(), true))) {
                pw.println(java.time.Instant.now() + " [FeedbackService] " + msg);
            }
        } catch (Exception ignored) {
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    public List<StudentEnterpriseFeedback> findAll() {
        debugLog("findAll");
        return repository.findAll();
    }

    @Override
    public StudentEnterpriseFeedback findById(UUID id) {
        debugLog("findById id=" + id);
        StudentEnterpriseFeedback feedback = repository.findById(id).orElse(null);
        if (feedback == null) {
            return null;
        }
        User currentUser = getCurrentUser();
        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("SYSTEM_ADMIN")
                        || role.getRole().getRoleName().equals("ADMIN")
                        || role.getRole().getRoleName().equals("TRAINING_MANAGER"));
        if (isStaff) {
            return feedback;
        }
        if (!feedback.getStudent().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return feedback;
    }

    @Override
    public List<StudentEnterpriseFeedback> findMyFeedbacks(UUID studentId) {
        debugLog("findMyFeedbacks studentId=" + studentId);
        try {
            List<StudentEnterpriseFeedback> result = repository.findByStudent_UserId(studentId);
            debugLog("findMyFeedbacks result size=" + result.size());
            return result;
        } catch (Exception e) {
            debugLog("findMyFeedbacks EXCEPTION: " + e.getClass().getName() + " - " + e.getMessage());
            // Stack trace removed for security
            throw e;
        }
    }

    @Override
    public StudentEnterpriseFeedback save(StudentEnterpriseFeedback entity) {
        debugLog("save called");
        User currentUser = getCurrentUser();

        if (entity.getStudent() == null) {
            entity.setStudent(currentUser);
        }

        if (entity.getSemester() == null || entity.getSemester().getSemesterId() == null) {
            throw new AppException(ErrorCode.SEMESTER_ID_REQUIRED);
        }
        if (entity.getEnterprise() == null || entity.getEnterprise().getEnterpriseId() == null) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }

        // Check if student is eligible
        com.ueims.model.entity.EligibleStudent eligibleStudent = eligibleStudentRepository
                .findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), entity.getSemester().getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE));

        if (eligibleStudent.getCurrentSemester() == null || eligibleStudent.getCurrentSemester() < 7) {
            throw new AppException(ErrorCode.STUDENT_NOT_IN_SEMESTER_7);
        }

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
        StudentEnterpriseFeedback feedback = repository.findById(id).orElse(null);
        if (feedback == null) {
            return;
        }

        User currentUser = getCurrentUser();
        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("SYSTEM_ADMIN")
                        || role.getRole().getRoleName().equals("ADMIN")
                        || role.getRole().getRoleName().equals("TRAINING_MANAGER"));
        if (!isStaff) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        repository.deleteById(id);
    }
}
