package com.ueims.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface EligibleStudentRepository extends JpaRepository<EligibleStudent, UUID> {

    boolean existsByStudentCodeAndSemester_SemesterId(String studentCode, UUID semesterId);
}
