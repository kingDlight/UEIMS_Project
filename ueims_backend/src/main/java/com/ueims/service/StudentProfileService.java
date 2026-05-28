package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.StudentProfile;

public interface StudentProfileService {
    List<StudentProfile> findAll();

    StudentProfile findById(UUID id);

    StudentProfile save(StudentProfile entity);

    void deleteById(UUID id);
}
