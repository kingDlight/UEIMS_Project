package com.ueims.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.EnterpriseEvaluation;
import com.ueims.model.entity.User;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.EnterpriseEvaluationRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.EnterpriseEvaluationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnterpriseEvaluationServiceImpl implements EnterpriseEvaluationService {
    private final EnterpriseEvaluationRepository repository;
    private final UserRepository userRepository;
    private final EnterpriseAssignmentRepository assignmentRepository;
    private final EligibleStudentRepository eligibleStudentRepository;

    // BR-43: Trọng số các tiêu chí (Constants)
    private static final BigDecimal WEIGHT_ATTITUDE = new BigDecimal("0.2");
    private static final BigDecimal WEIGHT_PROFESSIONALISM = new BigDecimal("0.4");
    private static final BigDecimal WEIGHT_SOFT_SKILLS = new BigDecimal("0.2");
    private static final BigDecimal WEIGHT_PROGRESS = new BigDecimal("0.2");

    @Override
    @Transactional(readOnly = true)
    public List<EnterpriseEvaluation> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public EnterpriseEvaluation findById(UUID id) {
        EnterpriseEvaluation evaluation =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        validateAccess(evaluation);
        return evaluation;
    }

    @Override
    @Transactional
    public EnterpriseEvaluation save(EnterpriseEvaluation entity) {
        if (entity.getAssignment() == null || entity.getAssignment().getAssignmentId() == null) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }

        // BR-42: Đảm bảo các điểm số không được null và nằm trong khoảng [0, 10]
        BigDecimal attitude = entity.getAttitudeScore();
        BigDecimal prof = entity.getProfessionalismScore();
        BigDecimal softSkills = entity.getSoftSkillsScore();
        BigDecimal progress = entity.getProgressScore();

        if (attitude == null || prof == null || softSkills == null || progress == null) {
            throw new AppException(ErrorCode.MISSING_EVALUATION_CRITERIA);
        }

        if (isInvalidScore(attitude)
                || isInvalidScore(prof)
                || isInvalidScore(softSkills)
                || isInvalidScore(progress)) {
            throw new AppException(ErrorCode.INVALID_SCORE_RANGE);
        }

        // Lấy thông tin phân công từ DB để đảm bảo tính xác thực
        EnterpriseAssignment assignment = assignmentRepository
                .findById(entity.getAssignment().getAssignmentId())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        // BR-14: Kiểm tra trạng thái học kỳ. Không cho phép đánh giá nếu học kỳ đã LOCKED hoặc CLOSED
        String semesterStatus = assignment.getSemester().getStatus();
        if ("LOCKED".equals(semesterStatus) || "CLOSED".equals(semesterStatus)) {
            throw new AppException(ErrorCode.SEMESTER_LOCKED_DATE);
        }

        // Kiểm tra trạng thái sinh viên: Chỉ cho phép đánh giá nếu sinh viên đang trong trạng thái OJT
        // Dựa trên logic UC-23 và UC-25
        String studentStatus = assignment.getStudent().getStatus();
        if (!"OJT".equals(studentStatus)) {
            throw new AppException(ErrorCode.INVALID_STATUS_FOR_OJT);
        }

        // Kiểm tra quyền sở hữu: Chỉ doanh nghiệp được phân công cho sinh viên này mới có thể đánh giá
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null
                || !"ACTIVE".equals(currentUser.getEnterprise().getStatus())
                || !assignment
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-44: Kiểm tra xem đánh giá đã tồn tại và bị khóa chưa
        repository.findByAssignment_AssignmentId(assignment.getAssignmentId()).ifPresent(existing -> {
            if (Boolean.TRUE.equals(existing.getIsLocked())) {
                throw new AppException(ErrorCode.EVALUATION_LOCKED);
            }
            entity.setEvaluationId(existing.getEvaluationId());
        });

        // BR-43: Weighted Score Formula
        BigDecimal totalScore = attitude.multiply(WEIGHT_ATTITUDE)
                .add(prof.multiply(WEIGHT_PROFESSIONALISM))
                .add(softSkills.multiply(WEIGHT_SOFT_SKILLS))
                .add(progress.multiply(WEIGHT_PROGRESS))
                .setScale(1, RoundingMode.HALF_UP);

        entity.setTotalScore(totalScore);

        // BR-44: Thiết lập trạng thái khóa và thời gian nộp (Final Submission)
        entity.setIsLocked(true);
        if (entity.getSubmittedAt() == null) {
            entity.setSubmittedAt(LocalDateTime.now());
        }
        entity.setAssignment(assignment);

        return repository.save(entity);
    }

    /**
     * BR-52: Kiểm tra quyền truy cập thông tin điểm số
     */
    private void validateAccess(EnterpriseEvaluation evaluation) {
        User currentUser = getCurrentUser();

        // 1. Nếu là TM hoặc ADMIN -> Cho phép xem
        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(r -> r.getRole().getRoleName().equals("TRAINING_MANAGER")
                        || r.getRole().getRoleName().equals("SYSTEM_ADMIN"));
        if (isStaff) return;

        // 2. Nếu là ENTERPRISE -> Phải là doanh nghiệp đã chấm điểm
        if (currentUser.getEnterprise() != null) {
            if (!evaluation
                    .getAssignment()
                    .getEnterprise()
                    .getEnterpriseId()
                    .equals(currentUser.getEnterprise().getEnterpriseId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            return;
        }

        // 3. Nếu là STUDENT -> Chỉ được xem điểm của chính mình
        if (!evaluation.getAssignment().getStudent().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-54: Kiểm tra học kỳ hiện tại của sinh viên để cho phép xem kết quả (Semester 7-9)
        eligibleStudentRepository
                .findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(),
                        evaluation.getAssignment().getSemester().getSemesterId())
                .ifPresent(eligible -> {
                    if (eligible.getCurrentSemester() != null && eligible.getCurrentSemester() < 7) {
                        throw new AppException(ErrorCode.STUDENT_RESULT_ACCESS_DENIED);
                    }
                });
    }

    private boolean isInvalidScore(BigDecimal score) {
        return score.compareTo(BigDecimal.ZERO) < 0 || score.compareTo(BigDecimal.TEN) > 0;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
