package com.ueims.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface EligibleStudentRepository extends JpaRepository<EligibleStudent, UUID> {

    boolean existsByStudentCodeAndSemester_SemesterId(String studentCode, UUID semesterId);

    java.util.Optional<EligibleStudent> findByUser_UserIdAndSemester_SemesterId(UUID userId, UUID semesterId);

    java.util.List<EligibleStudent> findBySemester_SemesterIdAndStatus(UUID semesterId, String status);

    java.util.List<EligibleStudent> findBySemester_SemesterId(UUID semesterId);

    @org.springframework.data.jpa.repository.Query(
            "SELECT new com.ueims.model.dto.dashboard.ChartDataDTO(e.major, COUNT(e)) FROM EligibleStudent e WHERE e.semester.semesterId = :semesterId GROUP BY e.major")
    java.util.List<com.ueims.model.dto.dashboard.ChartDataDTO> countStudentsByMajor(
            @org.springframework.data.repository.query.Param("semesterId") UUID semesterId);
}
