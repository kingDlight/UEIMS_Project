package com.ueims.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.StudentProfile;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {
    StudentProfile findByUser_UserId(UUID userId);

    Optional<StudentProfile> findByStudentCode(String studentCode);

    boolean existsByStudentCode(String studentCode);
}
