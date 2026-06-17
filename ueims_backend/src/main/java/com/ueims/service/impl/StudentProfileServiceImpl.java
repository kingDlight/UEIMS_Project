package com.ueims.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.request.StudentProfileUpdateRequest;
import com.ueims.dto.response.MyProfileResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.StudentProfile;
import com.ueims.model.entity.User;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.StudentProfileRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.StudentProfileService;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StudentProfileServiceImpl implements StudentProfileService {
    private static final String USER_DIR_PROPERTY = "user.dir";

    StudentProfileRepository repository;
    UserRepository userRepository;
    ApplicationRepository applicationRepository;
    EnterpriseAssignmentRepository enterpriseAssignmentRepository;
    EligibleStudentRepository eligibleStudentRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    public List<StudentProfile> findAll() {
        return repository.findAll();
    }

    @Override
    public StudentProfile findByUserId(UUID userId) {
        return repository.findByUser_UserId(userId);
    }

    @Override
    public StudentProfile findById(UUID id) {
        StudentProfile profile = repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        User currentUser = getCurrentUser();

        boolean isAdminOrTM = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("SYSTEM_ADMIN")
                        || role.getRole().getRoleName().equals("ADMIN")
                        || role.getRole().getRoleName().equals("TRAINING_MANAGER"));

        if (isAdminOrTM) {
            return profile;
        }

        boolean isStudent = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("STUDENT"));

        if (isStudent) {
            if (!profile.getUser().getUserId().equals(currentUser.getUserId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            return profile;
        }

        boolean isEnterprise = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("ENTERPRISE"));

        if (isEnterprise) {
            UUID studentId = profile.getUser().getUserId();
            UUID enterpriseId = currentUser.getEnterprise().getEnterpriseId();

            boolean hasApplication = applicationRepository.existsByJobPost_Enterprise_EnterpriseIdAndStudent_UserId(
                    enterpriseId, studentId);
            boolean hasAssignment = enterpriseAssignmentRepository.existsByEnterprise_EnterpriseIdAndStudent_UserId(
                    enterpriseId, studentId);

            if (!hasApplication && !hasAssignment) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            return profile;
        }

        throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    @Override
    public StudentProfile save(StudentProfile entity) {
        return repository.save(entity);
    }

    @Override
    public StudentProfile updateProfile(UUID id, StudentProfileUpdateRequest request) {
        StudentProfile profile = repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        // Ownership verification (Security BOLA check)
        User currentUser = getCurrentUser();
        if (!profile.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        profile.setMajor(request.getMajor());
        profile.setSkills(request.getSkills());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setPortfolioUrl(request.getPortfolioUrl());
        profile.setBio(request.getBio());
        return repository.save(profile);
    }

    @Override
    public StudentProfile uploadCv(UUID id, MultipartFile file) {
        StudentProfile profile = repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        // Ownership verification (Security BOLA check)
        User currentUser = getCurrentUser();
        if (!profile.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.CV_NOT_UPLOADED);
        }

        String originalFilename = StringUtils.getFilename(file.getOriginalFilename());
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new AppException(ErrorCode.INVALID_CV_FORMAT);
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new AppException(ErrorCode.CV_SIZE_EXCEEDED);
        }

        try {
            // Delete existing CV file if present (prevent spam / orphan files)
            String oldCvUrl = profile.getCvUrl();
            if (oldCvUrl != null && !oldCvUrl.isBlank()) {
                Path oldPath = Paths.get(System.getProperty(USER_DIR_PROPERTY),
                        oldCvUrl.replace("/uploads/", "uploads/"));
                Files.deleteIfExists(oldPath);
            }

            Path uploadDir = Paths.get(System.getProperty(USER_DIR_PROPERTY), "uploads", "cv");
            Files.createDirectories(uploadDir);
            String stored = id.toString() + "_" + System.currentTimeMillis() + "_"
                    + StringUtils.cleanPath(originalFilename);
            Path path = uploadDir.resolve(stored);
            file.transferTo(path.toFile());
            profile.setCvUrl("/uploads/cv/" + stored);
            profile.setCvFileName(originalFilename);
            return repository.save(profile);
        } catch (IOException e) {
            log.error("[CV Upload] IOException: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public StudentProfile deleteCv(UUID id) {
        StudentProfile profile = repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        User currentUser = getCurrentUser();
        if (!profile.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String oldCvUrl = profile.getCvUrl();
        if (oldCvUrl != null && !oldCvUrl.isBlank()) {
            try {
                Path oldPath = Paths.get(System.getProperty(USER_DIR_PROPERTY),
                        oldCvUrl.replace("/uploads/", "uploads/"));
                Files.deleteIfExists(oldPath);
            } catch (IOException e) {
                log.error("[CV Delete] Failed to delete file: {}", e.getMessage(), e);
            }
            profile.setCvUrl(null);
            profile.setCvFileName(null);
        }
        return repository.save(profile);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public MyProfileResponse getMyFullProfile(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        StudentProfile profile = repository.findByUser_UserId(userId);

        MyProfileResponse.MyProfileResponseBuilder builder = MyProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus());

        // Get latest eligible student record for semester info
        var latestEligible = eligibleStudentRepository.findTopByUser_UserIdOrderByImportedAtDesc(userId);

        if (profile == null) {
            // Lazily create profile if not exists
            profile = new StudentProfile();
            profile.setUser(user);
            if (latestEligible.isPresent()) {
                profile.setStudentCode(latestEligible.get().getStudentCode());
                profile.setMajor(latestEligible.get().getMajor());
            } else {
                profile.setStudentCode(
                        user.getEmail() != null ? user.getEmail().split("@")[0].toUpperCase() : "UNKNOWN");
                profile.setMajor("N/A");
            }
            profile = repository.save(profile);
        }

        builder.profileId(profile.getProfileId())
                .studentCode(profile.getStudentCode())
                .major(profile.getMajor())
                .skills(profile.getSkills())
                .cvUrl(profile.getCvUrl())
                .cvFileName(profile.getCvFileName())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .bio(profile.getBio());

        if (latestEligible.isPresent()) {
            var eligible = latestEligible.get();
            builder.currentSemester(eligible.getCurrentSemester())
                    .gpa(eligible.getGpa())
                    .ojtStatus(eligible.getStatus());
            if (eligible.getSemester() != null) {
                builder.semesterName(eligible.getSemester().getName())
                        .semesterCode(eligible.getSemester().getSemesterCode());
            }
        }

        return builder.build();
    }
}
