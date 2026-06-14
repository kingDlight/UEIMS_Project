package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.Application;
import com.ueims.model.entity.ApplicationStatus;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    boolean existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotAndDeletedAtIsNull(
            UUID jobPostId, UUID studentId, ApplicationStatus status);

    long countByStudent_UserIdAndStudent_DeletedAtIsNull(UUID studentId);

    List<Application> findByStudent_UserId(UUID studentId);

    boolean existsByJobPost_Enterprise_EnterpriseIdAndStudent_UserId(UUID enterpriseId, UUID studentId);

    List<Application> findByJobPost_Enterprise_EnterpriseId(UUID enterpriseId);

    List<Application> findByJobPost_Enterprise_EnterpriseIdAndDeletedAtIsNull(UUID enterpriseId);

    long countByStudent_UserIdAndStatusNotAndDeletedAtIsNull(UUID studentId, ApplicationStatus status);

    void deleteByJobPost_Enterprise_EnterpriseId(UUID enterpriseId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
            "UPDATE Application a SET a.cvDownloadCount = a.cvDownloadCount + 1 WHERE a.applicationId = :id")
    void incrementDownloadCount(@org.springframework.data.repository.query.Param("id") UUID id);
}
