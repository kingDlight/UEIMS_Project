package com.ueims.service;

import com.ueims.model.entity.StudentProfile;
import java.util.List;
import java.util.UUID;

public interface StudentProfileService {
    List<StudentProfile> findAll();
    StudentProfile findById(UUID id);
    StudentProfile save(StudentProfile entity);
    void deleteById(UUID id);
}
