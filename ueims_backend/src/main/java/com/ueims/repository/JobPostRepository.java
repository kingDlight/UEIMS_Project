package com.ueims.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.JobPost;

@Repository
public interface JobPostRepository extends JpaRepository<JobPost, UUID> {
    List<JobPost> findByStatusAndDeletedAtIsNull(String status);

    List<JobPost> findByStatusAndSemester_StatusAndDeletedAtIsNull(String status, String semesterStatus);

    /**
     * Active job posts visible to students: OPEN + semester ACTIVE + deadline >= today.
     * Excludes expired posts so students don't see stale listings from past semesters.
     * BR-30 (semester must be ACTIVE) + BR-48-equivalent (deadline filter).
     */
    @Query("SELECT j FROM JobPost j WHERE j.status = 'OPEN' AND j.semester.status = 'ACTIVE' "
            + "AND j.deletedAt IS NULL AND (j.applicationDeadline IS NULL OR j.applicationDeadline >= :today)")
    List<JobPost> findActiveForStudents(@Param("today") LocalDate today);

    List<JobPost> findAllByDeletedAtIsNull();

    List<JobPost> findByEnterprise_EnterpriseId(UUID enterpriseId);

    void deleteByEnterprise_EnterpriseId(UUID enterpriseId);

    @EntityGraph(attributePaths = {"enterprise"})
    Optional<JobPost> findWithEnterpriseByJobPostId(UUID id);
}
