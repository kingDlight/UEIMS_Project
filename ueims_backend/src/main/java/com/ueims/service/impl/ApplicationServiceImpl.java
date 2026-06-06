package com.ueims.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.ApplicationRequest;
import com.ueims.dto.request.ApplicationScreenRequest;
import com.ueims.dto.response.ApplicationResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.mapper.ApplicationMapper;
import com.ueims.model.entity.*;
import com.ueims.model.entity.ApplicationStatus;
import com.ueims.repository.*;
import com.ueims.service.ApplicationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {
    private final ApplicationRepository repository;
    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;
    private final EligibleStudentRepository eligibleStudentRepository;
    private final ApplicationMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> findAll() {
        return repository.findAll().stream().map(mapper::toApplicationResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse findById(UUID id) {
        Application application =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));
        return mapper.toApplicationResponse(application);
    }

    @Override
    @Transactional
    public ApplicationResponse applyForJob(ApplicationRequest request) {
        // 1. Verify JobPost exists
        JobPost jobPost = jobPostRepository
                .findById(request.getJobPostId())
                .orElseThrow(() -> new AppException(ErrorCode.JOB_POST_NOT_FOUND));

        // 2. Verify Student exists
        User student = userRepository
                .findById(request.getStudentId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // 3. Verify JobPost is not closed
        if ("CLOSED".equalsIgnoreCase(jobPost.getStatus())) {
            throw new AppException(ErrorCode.JOB_POST_CLOSED);
        }

        // 4. Verify deadline
        if (jobPost.getApplicationDeadline() != null && LocalDate.now().isAfter(jobPost.getApplicationDeadline())) {
            throw new AppException(ErrorCode.APPLICATION_DEADLINE_EXPIRED);
        }

        // 5. Verify Student is eligible (semester etc.)
        EligibleStudent eligibleStudent = eligibleStudentRepository
                .findByUser_UserIdAndSemester_SemesterId(
                        student.getUserId(), jobPost.getSemester().getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE));
        if (eligibleStudent.getCurrentSemester() == null || eligibleStudent.getCurrentSemester() != 5) {
            throw new AppException(ErrorCode.STUDENT_NOT_IN_SEMESTER_5);
        }

        // 6. Verify no active application for this job post
        boolean hasActiveApplication =
                repository.existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotAndDeletedAtIsNull(
                        jobPost.getJobPostId(), student.getUserId(), ApplicationStatus.WITHDRAWN);
        if (hasActiveApplication) {
            throw new AppException(ErrorCode.DUPLICATE_APPLICATION);
        }

        // 7. Verify max 3 applications per student
        long activeCount = repository.countByStudent_UserIdAndStatusNotAndDeletedAtIsNull(
                student.getUserId(), ApplicationStatus.WITHDRAWN);
        if (activeCount >= 3) {
            throw new AppException(ErrorCode.MAX_APPLICATIONS_LIMIT_REACHED);
        }

        // 8. Validate CV File Url & optional size
        String cvUrl = request.getCvFileUrl();
        Long cvSize = request.getCvFileSize();

        if (cvUrl == null || cvUrl.trim().isEmpty()) {
            throw new AppException(ErrorCode.CV_NOT_UPLOADED);
        }
        cvUrl = cvUrl.trim();

        // Validate CV format (Strictly PDF)
        if (!cvUrl.toLowerCase().endsWith(".pdf")) {
            throw new AppException(ErrorCode.INVALID_CV_FORMAT);
        }

        // Validate CV size (Max 5MB)
        if (cvSize != null && cvSize > 5242880) {
            throw new AppException(ErrorCode.CV_SIZE_EXCEEDED);
        }

        // Persist Application entity
        Application entity = Application.builder()
                .jobPost(jobPost)
                .student(student)
                .cvFileUrl(cvUrl)
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.PENDING)
                .build();

        Application saved = repository.save(entity);
        return mapper.toApplicationResponse(saved);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public ApplicationResponse withdrawApplication(UUID applicationId) {
        // 1. Get the application
        Application application =
                repository.findById(applicationId).orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        // 2. E1: Ensure the current student owns this application
        User currentUser = getCurrentUser();
        if (!application.getStudent().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // 3. BR-48: Check if application deadline has passed
        JobPost jobPost = application.getJobPost();
        if (jobPost.getApplicationDeadline() != null && LocalDate.now().isAfter(jobPost.getApplicationDeadline())) {
            throw new AppException(ErrorCode.APPLICATION_DEADLINE_EXPIRED);
        }

        // 3. E2: Check if application status is still PENDING
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new AppException(ErrorCode.APPLICATION_STATUS_CHANGED);
        }

        // 4. Update status to WITHDRAWN
        application.setStatus(ApplicationStatus.WITHDRAWN);
        Application updated = repository.save(application);

        return mapper.toApplicationResponse(updated);
    }

    @Override
    @Transactional
    public ApplicationResponse screenApplication(UUID id, ApplicationScreenRequest request) {
        Application application =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        // BR-33: Chỉ cho phép lọc nếu đang ở trạng thái PENDING
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new AppException(ErrorCode.APPLICATION_STATUS_CHANGED);
        }

        // Kiểm tra quyền: Chỉ Enterprise sở hữu JobPost này mới được lọc CV
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null
                || !application
                        .getJobPost()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        application.setStatus(request.getStatus());

        if (request.getStatus() == ApplicationStatus.SCREENING_REJECTED) {
            application.setRejectionReason(request.getRejectionReason());
        } else {
            // Đảm bảo xóa lý do cũ nếu trạng thái là PASSED
            application.setRejectionReason(null);
        }

        application.setScreenedBy(currentUser);

        return mapper.toApplicationResponse(repository.save(application));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
