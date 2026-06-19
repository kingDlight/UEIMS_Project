package com.ueims.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.JobPost;

@Repository
public interface JobPostRepository extends JpaRepository<JobPost, UUID> {
    List<JobPost> findByStatusAndDeletedAtIsNull(String status);

    List<JobPost> findAllByDeletedAtIsNull();

    List<JobPost> findByEnterprise_EnterpriseId(UUID enterpriseId);

    void deleteByEnterprise_EnterpriseId(UUID enterpriseId);

    @EntityGraph(attributePaths = {"enterprise"})
    Optional<JobPost> findWithEnterpriseByJobPostId(UUID id);
}
