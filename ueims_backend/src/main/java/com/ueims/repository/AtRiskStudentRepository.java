package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.AtRiskStudent;

@Repository
public interface AtRiskStudentRepository extends JpaRepository<AtRiskStudent, UUID> {
    List<AtRiskStudent> findBySemesterId(UUID semesterId);

    Page<AtRiskStudent> findBySemesterId(UUID semesterId, Pageable pageable);

    List<AtRiskStudent> findBySemesterIdAndRiskCategory(UUID semesterId, String riskCategory);

    Page<AtRiskStudent> findBySemesterIdAndRiskCategory(UUID semesterId, String riskCategory, Pageable pageable);

    List<AtRiskStudent> findBySemesterIdAndPriorityScoreGreaterThanEqual(UUID semesterId, Integer minPriority);
}
