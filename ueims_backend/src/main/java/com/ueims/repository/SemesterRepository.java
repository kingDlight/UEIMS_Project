package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, UUID>, JpaSpecificationExecutor<Semester> {
    boolean existsBySemesterCode(String semesterCode);

    List<Semester> findByStatus(String status);

    Optional<Semester> findBySemesterCode(String semesterCode);
}
