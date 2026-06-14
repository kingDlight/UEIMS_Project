package com.ueims.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.InternshipPlan;

@Repository
public interface InternshipPlanRepository extends JpaRepository<InternshipPlan, UUID> {
    InternshipPlan findByAssignment_Student_UserId(UUID studentId);

    java.util.List<InternshipPlan> findByAssignment_AssignmentId(UUID assignmentId);
}
