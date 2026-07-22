package com.ueims.service.impl;

import java.time.LocalDate;
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
import com.ueims.model.entity.StudentProfile;
import com.ueims.model.entity.User;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.StudentProfileRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.JobPostService;
import com.ueims.service.JobRecommenderService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JobPostServiceImpl implements JobPostService {
    JobPostRepository repository;
    UserRepository userRepository;
    SemesterRepository semesterRepository;
    JobRecommenderService recommenderService;
    StudentProfileRepository studentProfileRepository;
    ApplicationRepository applicationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<JobPost> findAll() {
        return repository.findAllByDeletedAtIsNull();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPost> findMyPosts() {
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null) {
            return java.util.Collections.emptyList();
        }
        List<JobPost> posts = repository.findByEnterprise_EnterpriseId(
                currentUser.getEnterprise().getEnterpriseId());
        // BR-49: tell enterprises which posts are full so they can decide to
        // extend positions via edit. Required so they don't accidentally leave
        // a "stale OPEN" post lying around that students can't apply to.
        populateFillState(posts);
        return posts;
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPost> findActive() {
        // BR-30 + deadline filter: students only see OPEN posts whose deadline is
        // still in the future. Expired posts are intentionally hidden so the student
        // job board doesn't accumulate stale listings from past semesters.
        List<JobPost> activeJobs = repository.findActiveForStudents(LocalDate.now());

        // BR-49: drop posts that already hit their max_positions cap. The slot is
        // reserved the moment a student applies (no CV screening required), so the
        // board must hide a post the second the last seat is taken — otherwise a
        // 101st student could squeeze in and silently overshoot the limit.
        // We re-query the count per post (cheap, indexed on job_post_id) instead of
        // relying on entity state, because positionsCount can change between the
        // list query and this filter step.
        activeJobs = activeJobs.stream()
                .filter(p -> {
                    long taken = applicationRepository.countActiveApplicationsForJob(p.getJobPostId());
                    int max = p.getPositionsCount() == null ? 0 : p.getPositionsCount();
                    return taken < max;
                })
                .toList();

        try {
            User currentUser = getCurrentUser();
            applyStudentRecommendations(activeJobs, currentUser);
        } catch (Exception e) {
            // Ignore if not logged in or any other error, just return the raw list
        }

        return activeJobs;
    }

    /**
     * Populates {@code currentApplicationCount} + {@code full} on every post in the
     * list. Used by enterprise views so the "Full" badge / remaining seats are
     * visible without an extra round-trip from the frontend.
     */
    private void populateFillState(List<JobPost> posts) {
        for (JobPost p : posts) {
            long taken = applicationRepository.countActiveApplicationsForJob(p.getJobPostId());
            int max = p.getPositionsCount() == null ? 0 : p.getPositionsCount();
            p.setCurrentApplicationCount(taken);
            p.setFull(taken >= max);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public JobPost findById(UUID id) {
        JobPost post = repository
                .findWithEnterpriseByJobPostId(id)
                .orElseThrow(() -> new AppException(ErrorCode.JOB_POST_NOT_FOUND));
        long taken = applicationRepository.countActiveApplicationsForJob(post.getJobPostId());
        int max = post.getPositionsCount() == null ? 0 : post.getPositionsCount();
        post.setCurrentApplicationCount(taken);
        post.setFull(taken >= max);
        return post;
    }

    @Override
    @Transactional
    public JobPost create(JobPostRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null
                || !"APPROVED".equals(currentUser.getEnterprise().getStatus())) {
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
                .createdBy(currentUser)
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

        // BR-11: Cannot delete job post if it already has applications
        if (applicationRepository.existsByJobPost_JobPostId(id)) {
            throw new AppException(ErrorCode.JOB_POST_HAS_APPLICATIONS);
        }

        existing.setDeletedAt(LocalDateTime.now());
        repository.save(existing);
    }

    @Override
    @Transactional
    public JobPost toggleStatus(UUID id, String status) {
        JobPost existing = findById(id);
        validateOwnership(existing);
        String upper = status == null ? "" : status.toUpperCase();
        if (!upper.equals("OPEN") && !upper.equals("CLOSED")) {
            throw new AppException(ErrorCode.INVALID_PARAMETER_FORMAT);
        }
        existing.setStatus(upper);
        return repository.save(existing);
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

        // Kiểm tra quyền sở hữu (creatorId) của bài đăng
        if (jobPost.getCreatedBy() != null
                && !jobPost.getCreatedBy().getUserId().equals(currentUser.getUserId())) {
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

    private void applyStudentRecommendations(List<JobPost> activeJobs, User currentUser) {
        boolean isStudent = currentUser.getRoles().stream()
                .anyMatch(r -> "STUDENT".equals(r.getRole().getRoleName()));
        if (!isStudent) return;

        StudentProfile profile = studentProfileRepository.findByUser_UserId(currentUser.getUserId());
        if (profile == null || profile.getSkills() == null) return;

        for (JobPost job : activeJobs) {
            double score = recommenderService.calculateCompatibility(profile.getSkills(), job.getRequiredSkills());
            job.setCompatibilityScore(score);
            job.setIsHighlyRecommended(score >= 0.6); // BR-57
        }

        activeJobs.sort((a, b) -> Double.compare(
                b.getCompatibilityScore() != null ? b.getCompatibilityScore() : 0.0,
                a.getCompatibilityScore() != null ? a.getCompatibilityScore() : 0.0));
    }
}
