package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.InternshipPlan;

@Repository
public interface InternshipPlanRepository extends JpaRepository<InternshipPlan, UUID> {
    InternshipPlan findByAssignment_Student_UserId(UUID studentId);

    List<InternshipPlan> findByAssignment_AssignmentIdIn(List<UUID> assignmentIds);

    List<InternshipPlan> findByAssignment_AssignmentId(UUID assignmentId);

    List<InternshipPlan> findByJobPost_JobPostId(UUID jobPostId);

    List<InternshipPlan> findByStatus(String status);

    List<InternshipPlan> findByJobPost_Enterprise_EnterpriseIdAndStatus(UUID enterpriseId, String status);
}
