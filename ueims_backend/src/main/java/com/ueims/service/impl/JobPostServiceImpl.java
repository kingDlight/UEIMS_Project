package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.JobPostRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.JobPostService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobPostServiceImpl implements JobPostService {
    private final JobPostRepository repository;
    private final UserRepository userRepository;
    private final SemesterRepository semesterRepository;

    @Override
    public List<JobPost> findAll() {
        return repository.findAll();
    }

    @Override
    public JobPost findById(UUID id) {
        return repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.JOB_POST_NOT_FOUND));
    }

    @Override
    @Transactional
    public JobPost create(JobPostRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null
                || !"ACTIVE".equals(currentUser.getEnterprise().getStatus())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-30: Kiểm tra trạng thái Semester trước khi tạo mới
        if (request.getSemester() == null || request.getSemester().getSemesterId() == null) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }

        Semester semester = semesterRepository
                .findById(request.getSemester().getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));

        validateSemesterStatus(semester);

        JobPost entity = JobPost.builder()
                .enterprise(currentUser.getEnterprise())
                .semester(semester)
                .title(request.getTitle())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .requiredSkills(request.getRequiredSkills())
                .positionsCount(request.getPositionsCount())
                .applicationDeadline(request.getApplicationDeadline())
                .status(request.getStatus() != null ? request.getStatus() : "OPEN")
                .build();

        return repository.save(entity);
    }

    @Override
    @Transactional
    public JobPost update(UUID id, com.ueims.dto.request.JobPostRequest request) {
        JobPost existing = findById(id);
        validateOwnership(existing);
        validateSemesterStatus(existing.getSemester()); // BR-30

        existing.setTitle(request.getTitle());
        existing.setDescription(request.getDescription());
        existing.setRequirements(request.getRequirements());
        existing.setBenefits(request.getBenefits());
        existing.setRequiredSkills(request.getRequiredSkills());
        existing.setPositionsCount(request.getPositionsCount());
        existing.setApplicationDeadline(request.getApplicationDeadline());
        // BR-29: Cho phép Enterprise điều chỉnh trạng thái (OPEN/CLOSED...)
        if (request.getStatus() != null) {
            existing.setStatus(request.getStatus());
        }
        return repository.save(existing);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        JobPost existing = findById(id);
        validateOwnership(existing);
        validateSemesterStatus(existing.getSemester()); // BR-30
        existing.setDeletedAt(LocalDateTime.now());
        repository.save(existing);
    }

    /**
     * Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu của bài đăng này không
     * (BR-29)
     */
    private void validateOwnership(JobPost jobPost) {
        User currentUser = getCurrentUser();

        // Kiểm tra xem User có thuộc về Enterprise nào không
        if (currentUser.getEnterprise() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Kiểm tra bài đăng có thuộc về Enterprise của User đang login không
        UUID ownerId = jobPost.getEnterprise().getEnterpriseId();
        UUID currentEnterpriseId = currentUser.getEnterprise().getEnterpriseId();

        if (!ownerId.equals(currentEnterpriseId)) {
            // Ném lỗi Unauthorized (tương đương AccessDenied trong logic của project)
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    /**
     * Kiểm tra trạng thái học kỳ (BR-30)
     */
    private void validateSemesterStatus(Semester semester) {
        String status = semester.getStatus();
        if ("CLOSED".equals(status) || "LOCKED".equals(status)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
