package com.ueims.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.ApplicationRequest;
import com.ueims.dto.response.ApplicationResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.mapper.ApplicationMapper;
import com.ueims.model.entity.*;
import com.ueims.repository.*;
import com.ueims.service.ApplicationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {
    private final ApplicationRepository repository;
    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final EligibleStudentRepository eligibleStudentRepository;
    private final ApplicationMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> findAll() {
        return repository.findAll().stream().map(mapper::toApplicationResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse findById(UUID id) {
        Application application = repository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));
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
                        jobPost.getJobPostId(), student.getUserId(), "WITHDRAWN");
        if (hasActiveApplication) {
            throw new AppException(ErrorCode.DUPLICATE_APPLICATION);
        }

        // 7. Verify max 3 applications per student
        long activeCount = repository.countByStudent_UserIdAndStatusNotAndDeletedAtIsNull(student.getUserId(), "WITHDRAWN");
        if (activeCount >= 3) {
            throw new AppException(ErrorCode.MAX_APPLICATIONS_LIMIT_REACHED);
        }

        // 8. Resolve CV File Url & Size
        String cvUrl = request.getCvFileUrl();
        Long cvSize = request.getCvFileSize();

        if (cvUrl == null || cvUrl.trim().isEmpty()) {
            StudentProfile profile = studentProfileRepository
                    .findByUser_UserId(student.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));
            cvUrl = profile.getCvUrl();
            cvSize = profile.getCvFileSize();

            if (cvUrl == null || cvUrl.trim().isEmpty()) {
                throw new AppException(ErrorCode.CV_NOT_UPLOADED);
            }
        }

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
                .cvFileSize(cvSize)
                .coverLetter(request.getCoverLetter())
                .status("PENDING")
                .build();

        Application saved = repository.save(entity);
        return mapper.toApplicationResponse(saved);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
