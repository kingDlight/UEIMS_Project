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
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.StudentProfile;
import com.ueims.model.entity.User;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.StudentProfileRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.StudentProfileService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentProfileServiceImpl implements StudentProfileService {
    private final StudentProfileRepository repository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    public List<StudentProfile> findAll() {
        return repository.findAll();
    }

    @Override
    public StudentProfile findById(UUID id) {
        StudentProfile profile =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        User currentUser = getCurrentUser();

        boolean isAdminOrTM = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("SYSTEM_ADMIN")
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
        StudentProfile profile =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

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
        StudentProfile profile =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        // Ownership verification (Security BOLA check)
        User currentUser = getCurrentUser();
        if (!profile.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.CV_NOT_UPLOADED);
        }

        String filename = StringUtils.getFilename(file.getOriginalFilename());
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new AppException(ErrorCode.INVALID_CV_FORMAT);
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new AppException(ErrorCode.CV_SIZE_EXCEEDED);
        }

        try {
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "cv");
            Files.createDirectories(uploadDir);
            String stored = id.toString() + "_" + System.currentTimeMillis() + "_" + StringUtils.cleanPath(filename);
            Path path = uploadDir.resolve(stored);
            file.transferTo(path.toFile());
            profile.setCvUrl("/uploads/cv/" + stored);
            return repository.save(profile);
        } catch (IOException e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
