package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.StudentEnterpriseFeedback;

@Repository
public interface StudentEnterpriseFeedbackRepository extends JpaRepository<StudentEnterpriseFeedback, UUID> {
    boolean existsByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
            UUID studentId, UUID enterpriseId, UUID semesterId);

    java.util.List<StudentEnterpriseFeedback> findByStudent_UserId(UUID studentId);

    void deleteByEnterprise_EnterpriseId(UUID enterpriseId);
}
