package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface ReportFeedbackRepository extends JpaRepository<ReportFeedback, UUID> {
    List<ReportFeedback> findByReport_Assignment_Student_UserId(UUID studentId);
}
