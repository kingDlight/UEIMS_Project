package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.WeeklyReport;

@Repository
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, UUID> {
    List<WeeklyReport> findByAssignment_Semester_SemesterIdAndWeekNumberAndStatus(
            UUID semesterId, Integer weekNumber, String status);

    List<WeeklyReport> findByAssignment_Student_UserId(UUID studentId);

    void deleteByAssignment_AssignmentIdIn(List<UUID> assignmentIds);

    List<WeeklyReport> findByAssignment_AssignmentId(UUID assignmentId);

    // Eager-load assignment.student + assignment.semester + assignment.enterprise
    // to avoid LazyInitializationException when serializing WeeklyReportDTO fields
    // outside the transactional boundary.
    @Query("SELECT DISTINCT wr FROM WeeklyReport wr "
            + "JOIN FETCH wr.assignment a "
            + "LEFT JOIN FETCH a.student "
            + "LEFT JOIN FETCH a.semester "
            + "LEFT JOIN FETCH a.enterprise")
    List<WeeklyReport> findAllWithAssignmentGraph();

    @Query("SELECT DISTINCT wr FROM WeeklyReport wr "
            + "JOIN FETCH wr.assignment a "
            + "LEFT JOIN FETCH a.student "
            + "LEFT JOIN FETCH a.semester "
            + "LEFT JOIN FETCH a.enterprise "
            + "WHERE wr.reportId = :id")
    java.util.Optional<WeeklyReport> findByIdWithAssignmentGraph(@Param("id") UUID id);
}
