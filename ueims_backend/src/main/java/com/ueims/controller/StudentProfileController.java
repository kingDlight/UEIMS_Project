package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;

import com.ueims.model.entity.StudentProfile;
import com.ueims.service.StudentProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student-profiles")
@RequiredArgsConstructor
public class StudentProfileController {
    private final StudentProfileService service;

    @GetMapping
    public ResponseEntity<List<StudentProfile>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentProfile> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<StudentProfile> create(@Valid @RequestBody StudentProfile entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentProfile> update(@PathVariable java.util.UUID id,
                                                 @Valid @RequestBody com.ueims.dto.request.StudentProfileUpdateRequest req) {
        StudentProfile existing = service.findById(id);
        if (existing == null) throw new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND);
        existing.setMajor(req.getMajor());
        existing.setSkills(req.getSkills());
        existing.setLinkedinUrl(req.getLinkedinUrl());
        existing.setGithubUrl(req.getGithubUrl());
        existing.setPortfolioUrl(req.getPortfolioUrl());
        existing.setBio(req.getBio());
        return ResponseEntity.ok(service.save(existing));
    }

    @PostMapping("/{id}/upload-cv")
    public ResponseEntity<StudentProfile> uploadCv(@PathVariable java.util.UUID id, @RequestParam("file") MultipartFile file) {
        StudentProfile profile = service.findById(id);
        if (profile == null) throw new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND);

        if (file == null || file.isEmpty()) throw new AppException(ErrorCode.CV_NOT_UPLOADED);
        if (!StringUtils.getFilename(file.getOriginalFilename()).toLowerCase().endsWith(".pdf")) {
            throw new AppException(ErrorCode.INVALID_CV_FORMAT);
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new AppException(ErrorCode.CV_SIZE_EXCEEDED);
        }

        try {
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "cv");
            Files.createDirectories(uploadDir);
            String filename = id.toString() + "_" + System.currentTimeMillis() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
            Path dest = uploadDir.resolve(filename);
            file.transferTo(dest.toFile());
            profile.setCvUrl("/uploads/cv/" + filename);
            service.save(profile);
            return ResponseEntity.ok(profile);
        } catch (IOException e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
