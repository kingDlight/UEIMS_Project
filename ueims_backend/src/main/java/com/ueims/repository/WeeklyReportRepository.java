package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.WeeklyReport;

@Repository
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, UUID> {
    List<WeeklyReport> findByAssignment_Semester_SemesterIdAndWeekNumberAndStatus(
            UUID semesterId, Integer weekNumber, String status);

    List<WeeklyReport> findByAssignment_Student_UserId(UUID studentId);

    void deleteByAssignment_AssignmentIdIn(List<UUID> assignmentIds);

    List<WeeklyReport> findByAssignment_AssignmentId(UUID assignmentId);
}
