package com.ueims.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, UUID> {
    java.util.List<WeeklyReport> findByAssignment_Semester_SemesterIdAndWeekNumberAndStatus(
            UUID semesterId, Integer weekNumber, String status);
}
