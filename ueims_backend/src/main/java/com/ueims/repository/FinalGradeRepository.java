package com.ueims.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface FinalGradeRepository extends JpaRepository<FinalGrade, UUID> {
    @org.springframework.data.jpa.repository.Query(
            "SELECT f.gradeValue FROM FinalGrade f WHERE f.semester.semesterId = :semesterId")
    java.util.List<java.math.BigDecimal> findAllGradeValuesBySemesterId(
            @org.springframework.data.repository.query.Param("semesterId") UUID semesterId);
}
