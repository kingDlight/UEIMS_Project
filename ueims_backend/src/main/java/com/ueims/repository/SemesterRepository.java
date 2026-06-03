package com.ueims.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, UUID> {
    boolean existsBySemesterCode(String semesterCode);

    java.util.List<Semester> findByStatus(String status);
}
