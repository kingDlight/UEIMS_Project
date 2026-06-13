package com.ueims.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.FinalReport;

@Repository
public interface FinalReportRepository extends JpaRepository<FinalReport, UUID> {
    java.util.Optional<FinalReport> findByAssignment_AssignmentId(UUID assignmentId);

    java.util.Optional<FinalReport> findByAssignment_Student_UserId(UUID studentId);
}
