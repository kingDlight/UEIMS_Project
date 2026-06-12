package com.ueims.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface EnterpriseEvaluationRepository extends JpaRepository<EnterpriseEvaluation, UUID> {
    Optional<EnterpriseEvaluation> findByAssignment_AssignmentId(UUID assignmentId);

    Optional<EnterpriseEvaluation> findByAssignment_Student_UserId(UUID studentId);
}
