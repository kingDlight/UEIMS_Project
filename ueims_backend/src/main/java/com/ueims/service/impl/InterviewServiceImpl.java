package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Application;
import com.ueims.model.entity.ApplicationStatus;
import com.ueims.model.entity.Interview;
import com.ueims.model.entity.User;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.InterviewRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.InterviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {
    private final InterviewRepository repository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    @Override
    public List<Interview> findAll() {
        return repository.findAll();
    }

    @Override
    public Interview findById(UUID id) {
        return repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
    }

    @Override
    @Transactional
    public Interview save(Interview entity) {
        // BR-35: Interview date must be in the future
        if (entity.getScheduledTime() == null || entity.getScheduledTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INTERVIEW_DATE_MUST_BE_IN_FUTURE);
        }

        Application application = applicationRepository
                .findById(entity.getApplication().getApplicationId())
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        // BR-34: Ownership check (Enterprise can only schedule interviews for their own Job Post)
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null
                || !application
                        .getJobPost()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-36: Eligibility check (Only SCREENING_PASSED candidates can be scheduled)
        if (application.getStatus() != ApplicationStatus.SCREENING_PASSED
                && application.getStatus() != ApplicationStatus.INTERVIEW_SCHEDULED) {
            throw new AppException(ErrorCode.INTERVIEW_ELIGIBILITY_RULE);
        }

        // BR-35: Overlap check
        boolean isOverlapping = repository.existsByEnterpriseAndTime(
                currentUser.getEnterprise().getEnterpriseId(), entity.getScheduledTime());
        if (isOverlapping) {
            throw new AppException(ErrorCode.INTERVIEW_OVERLAP);
        }

        // Update application status
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        return repository.save(entity);
    }

    @Override
    @Transactional
    public Interview confirmAttendance(UUID id) {
        Interview interview =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));

        // BR-49: Irreversibility constraint (Cannot confirm if already declined)
        if (Boolean.FALSE.equals(interview.getStudentConfirmed())) {
            throw new AppException(ErrorCode.APPLICATION_STATUS_CHANGED);
        }

        interview.setStudentConfirmed(Boolean.TRUE);
        interview.setStatus("CONFIRMED");
        interview.setUpdatedAt(LocalDateTime.now());
        return repository.save(interview);
    }

    @Override
    @Transactional
    public Interview declineAttendance(UUID id, String reason) {
        Interview interview =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));

        // BR-49: Irreversibility constraint
        if (Boolean.TRUE.equals(interview.getStudentConfirmed())) {
            throw new AppException(ErrorCode.INTERVIEW_ALREADY_CONFIRMED);
        }

        interview.setStudentConfirmed(Boolean.FALSE);
        interview.setStatus("CANCELLED");
        interview.setFeedback(reason);
        interview.setUpdatedAt(LocalDateTime.now());

        // UC-58 & BR-49: Declining the interview automatically rejects the job application
        Application application = interview.getApplication();
        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectionReason("Student declined the interview: " + reason);
        applicationRepository.save(application);

        return repository.save(interview);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
