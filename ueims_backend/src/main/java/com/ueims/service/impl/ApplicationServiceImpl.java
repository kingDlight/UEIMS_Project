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
import com.ueims.model.entity.Application;
import com.ueims.model.entity.ApplicationStatus;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.User;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.StudentProfileRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.ApplicationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationServiceImpl implements ApplicationService {
    ApplicationRepository repository;
    JobPostRepository jobPostRepository;
    UserRepository userRepository;
    EligibleStudentRepository eligibleStudentRepository;
    StudentProfileRepository studentProfileRepository;
    ApplicationMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> findAll() {
        return repository.findAll().stream().map(mapper::toApplicationResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> findMyApplications() {
        User currentUser = getCurrentUser();
        return repository.findByStudent_UserId(currentUser.getUserId()).stream()
                .map(mapper::toApplicationResponse)
                .toList();
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
        JobPost jobPost = jobPostRepository
                .findById(request.getJobPostId())
                .orElseThrow(() -> new AppException(ErrorCode.JOB_POST_NOT_FOUND));

        User student;
        if (request.getStudentId() != null) {
            student = userRepository.findById(request.getStudentId()).orElse(null);
        } else {
            student = getCurrentUser();
        }
        if (student == null) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        validateJobPost(jobPost);
        validateStudentEligibility(student, jobPost);
        String cvUrl = getAndValidateCvUrl(request, student);

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

    private void validateJobPost(JobPost jobPost) {
        if ("CLOSED".equalsIgnoreCase(jobPost.getStatus())) {
            throw new AppException(ErrorCode.JOB_POST_CLOSED);
        }
        if (jobPost.getApplicationDeadline() != null && LocalDate.now().isAfter(jobPost.getApplicationDeadline())) {
            throw new AppException(ErrorCode.APPLICATION_DEADLINE_EXPIRED);
        }
    }

    private void validateStudentEligibility(User student, JobPost jobPost) {
        EligibleStudent eligibleStudent = eligibleStudentRepository
                .findByUser_UserIdAndSemester_SemesterId(
                        student.getUserId(), jobPost.getSemester().getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE));
        if (eligibleStudent.getCurrentSemester() == null || eligibleStudent.getCurrentSemester() != 5) {
            throw new AppException(ErrorCode.STUDENT_NOT_IN_SEMESTER_5);
        }

        boolean hasActiveApplication =
                repository.existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotAndDeletedAtIsNull(
                        jobPost.getJobPostId(), student.getUserId(), ApplicationStatus.WITHDRAWN);
        if (hasActiveApplication) {
            throw new AppException(ErrorCode.DUPLICATE_APPLICATION);
        }

        long activeCount = repository.countByStudent_UserIdAndStatusNotAndDeletedAtIsNull(
                student.getUserId(), ApplicationStatus.WITHDRAWN);
        if (activeCount >= 3) {
            throw new AppException(ErrorCode.MAX_APPLICATIONS_LIMIT_REACHED);
        }
    }

    private String getAndValidateCvUrl(ApplicationRequest request, User student) {
        String cvUrl = request.getCvFileUrl();
        if (cvUrl == null || cvUrl.trim().isEmpty()) {
            var studentProfile = studentProfileRepository.findByUser_UserId(student.getUserId());
            if (studentProfile != null
                    && studentProfile.getCvUrl() != null
                    && !studentProfile.getCvUrl().isEmpty()) {
                cvUrl = studentProfile.getCvUrl();
            } else {
                throw new AppException(ErrorCode.CV_NOT_UPLOADED);
            }
        }
        cvUrl = cvUrl.trim();

        if (!cvUrl.toLowerCase().endsWith(".pdf")) {
            throw new AppException(ErrorCode.INVALID_CV_FORMAT);
        }

        Long cvSize = request.getCvFileSize();
        if (cvSize != null && cvSize > 5242880) {
            throw new AppException(ErrorCode.CV_SIZE_EXCEEDED);
        }
        return cvUrl;
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

        // Đảm bảo chỉ được chuyển sang các trạng thái hợp lệ của vòng lọc CV
        if (request.getStatus() != ApplicationStatus.SCREENING_PASSED
                && request.getStatus() != ApplicationStatus.SCREENING_REJECTED) {
            throw new AppException(ErrorCode.INVALID_PARAMETER_FORMAT);
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
