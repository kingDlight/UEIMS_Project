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

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InterviewServiceImpl implements InterviewService {
    InterviewRepository repository;
    ApplicationRepository applicationRepository;
    UserRepository userRepository;

    @Override
    public List<Interview> findAll() {
        return repository.findAll();
    }

    @Override
    public List<Interview> findMyInterviews() {
        User currentUser = getCurrentUser();
        return repository.findByApplication_Student_UserId(currentUser.getUserId());
    }

    @Override
    public List<Interview> findMyEnterpriseInterviews() {
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null) {
            return List.of();
        }
        UUID enterpriseId = currentUser.getEnterprise().getEnterpriseId();
        return repository.findAll().stream()
                .filter(i -> i.getApplication() != null
                        && i.getApplication().getJobPost() != null
                        && i.getApplication().getJobPost().getEnterprise() != null
                        && enterpriseId.equals(
                                i.getApplication().getJobPost().getEnterprise().getEnterpriseId()))
                .toList();
    }

    @Override
    public Interview findById(UUID id) {
        return repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
    }

    @Override
    @Transactional
    public Interview save(Interview entity) {
        // BR-35: Kiểm tra ngày trong tương lai
        if (entity.getScheduledTime() == null || entity.getScheduledTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INTERVIEW_DATE_MUST_BE_IN_FUTURE);
        }

        Application application = applicationRepository
                .findById(entity.getApplication().getApplicationId())
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        // BR-34: Kiểm tra quyền sở hữu (Enterprise chỉ được lên lịch cho Job Post của mình)
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null
                || !application
                        .getJobPost()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-36: Kiểm tra điều kiện (Chỉ hồ sơ SCREENING_PASSED mới được lên lịch)
        if (application.getStatus() != ApplicationStatus.SCREENING_PASSED
                && application.getStatus() != ApplicationStatus.INTERVIEW_SCHEDULED) {
            throw new AppException(ErrorCode.INTERVIEW_ELIGIBILITY_RULE);
        }

        // BR-35: Kiểm tra trùng lịch (Giả định repository có method check overlap)
        // Logic: Kiểm tra xem Enterprise này đã có lịch nào trong khoảng thời gian này chưa
        boolean isOverlapping = repository.existsByEnterpriseAndTime(
                currentUser.getEnterprise().getEnterpriseId(), entity.getScheduledTime());
        if (isOverlapping) {
            throw new AppException(ErrorCode.INTERVIEW_OVERLAP);
        }

        // Cập nhật trạng thái đơn ứng tuyển
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        return repository.save(entity);
    }

    @Override
    @Transactional
    public Interview confirmAttendance(UUID id) {
        Interview interview =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));

        // BR-49: Không thể thay đổi nếu đã được xử lý trước đó (Decline)
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

        // BR-49: Tính không thể đảo ngược
        if (Boolean.TRUE.equals(interview.getStudentConfirmed())) {
            throw new AppException(ErrorCode.INTERVIEW_ALREADY_CONFIRMED);
        }

        interview.setStudentConfirmed(Boolean.FALSE);
        interview.setStatus("CANCELLED");
        interview.setFeedback(reason);
        interview.setUpdatedAt(LocalDateTime.now());

        // UC-58 & BR-49: Từ chối phỏng vấn sẽ tự động từ chối đơn ứng tuyển
        Application application = interview.getApplication();
        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectionReason("Sinh viên từ chối phỏng vấn: " + reason);
        applicationRepository.save(application);

        return repository.save(interview);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public Interview update(UUID id, Interview entity) {
        Interview existing = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        User currentUser = getCurrentUser();

        // Ownership check
        if (currentUser.getEnterprise() == null
                || existing.getApplication() == null
                || existing.getApplication().getJobPost() == null
                || existing.getApplication().getJobPost().getEnterprise() == null
                || !existing.getApplication()
                        .getJobPost()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-35: future time required when rescheduling
        if (entity.getScheduledTime() != null) {
            if (entity.getScheduledTime().isBefore(LocalDateTime.now())) {
                throw new AppException(ErrorCode.INTERVIEW_DATE_MUST_BE_IN_FUTURE);
            }
            existing.setScheduledTime(entity.getScheduledTime());
        }
        if (entity.getDurationMinutes() != null) existing.setDurationMinutes(entity.getDurationMinutes());
        if (entity.getMeetingLink() != null) existing.setMeetingLink(entity.getMeetingLink());
        if (entity.getLocation() != null) existing.setLocation(entity.getLocation());
        if (entity.getStatus() != null) existing.setStatus(entity.getStatus().toUpperCase());
        if (entity.getFeedback() != null) existing.setFeedback(entity.getFeedback());
        existing.setUpdatedAt(LocalDateTime.now());

        return repository.save(existing);
    }

    @Override
    @Transactional
    public Interview recordResult(UUID id, String result, String notes) {
        Interview existing = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        User currentUser = getCurrentUser();

        // Ownership check
        if (currentUser.getEnterprise() == null
                || existing.getApplication() == null
                || existing.getApplication().getJobPost() == null
                || existing.getApplication().getJobPost().getEnterprise() == null
                || !existing.getApplication()
                        .getJobPost()
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-37: must be COMPLETED before recording
        if (!"COMPLETED".equalsIgnoreCase(existing.getStatus())) {
            throw new AppException(ErrorCode.INTERVIEW_NOT_COMPLETED);
        }

        // BR-44: rejection requires notes
        if ("FAIL".equalsIgnoreCase(result) && (notes == null || notes.isBlank())) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }

        String upper = result == null ? "PASS" : result.toUpperCase();
        existing.setResult(upper);
        existing.setFeedback(notes);
        existing.setStatus("RESULT_RECORDED");
        existing.setUpdatedAt(LocalDateTime.now());

        // Update application status accordingly
        Application app = existing.getApplication();
        if ("PASS".equals(upper)) {
            app.setStatus(ApplicationStatus.ACCEPTED);
        } else if ("FAIL".equals(upper)) {
            app.setStatus(ApplicationStatus.REJECTED);
            app.setRejectionReason(notes);
        }
        applicationRepository.save(app);

        return repository.save(existing);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
