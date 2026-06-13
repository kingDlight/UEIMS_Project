package com.ueims.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.EnterpriseAssignment;

@Repository
public interface EnterpriseAssignmentRepository extends JpaRepository<EnterpriseAssignment, UUID> {

    @Query("SELECT ea FROM EnterpriseAssignment ea WHERE ea.semester.semesterId = :semesterId AND NOT EXISTS "
            + "(SELECT wr FROM WeeklyReport wr WHERE wr.assignment.assignmentId = ea.assignmentId "
            + "AND wr.weekNumber = :weekNumber AND wr.status != 'NOT_SUBMITTED')")
    List<EnterpriseAssignment> findAssignmentsWithLateReports(
            @Param("semesterId") UUID semesterId, @Param("weekNumber") Integer weekNumber);

    boolean existsByEnterprise_EnterpriseIdAndStudent_UserId(UUID enterpriseId, UUID studentId);

    Optional<EnterpriseAssignment> findByStudent_UserId(UUID studentId);

    List<EnterpriseAssignment> findByEnterprise_EnterpriseId(UUID enterpriseId);

    void deleteByEnterprise_EnterpriseId(UUID enterpriseId);
}
