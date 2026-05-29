package com.ueims.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    boolean existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotAndDeletedAtIsNull(
            UUID jobPostId, UUID studentId, ApplicationStatus status);

    long countByStudent_UserIdAndStatusNotAndDeletedAtIsNull(UUID studentId, ApplicationStatus status);
}
