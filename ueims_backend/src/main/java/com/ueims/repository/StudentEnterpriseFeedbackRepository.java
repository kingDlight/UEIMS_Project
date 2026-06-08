package com.ueims.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.StudentEnterpriseFeedback;

@Repository
public interface StudentEnterpriseFeedbackRepository extends JpaRepository<StudentEnterpriseFeedback, UUID> {
    boolean existsByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
            UUID studentId, UUID enterpriseId, UUID semesterId);
}
