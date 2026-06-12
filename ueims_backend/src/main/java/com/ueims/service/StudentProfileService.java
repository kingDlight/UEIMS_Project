package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.StudentProfile;

public interface StudentProfileService {
    List<StudentProfile> findAll();

    StudentProfile findById(UUID id);

    StudentProfile findByUserId(UUID userId);

    StudentProfile save(StudentProfile entity);

    StudentProfile updateProfile(UUID id, com.ueims.dto.request.StudentProfileUpdateRequest request);

    StudentProfile uploadCv(UUID id, org.springframework.web.multipart.MultipartFile file);

    void deleteById(UUID id);
}
