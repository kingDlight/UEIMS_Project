package com.ueims.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.Application;
import com.ueims.model.entity.ApplicationStatus;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    boolean existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotAndDeletedAtIsNull(
            UUID jobPostId, UUID studentId, ApplicationStatus status);

    boolean existsByJobPost_JobPostIdAndStudent_UserIdAndStatusNotInAndDeletedAtIsNull(
            UUID jobPostId, UUID studentId, Collection<ApplicationStatus> statuses);

    boolean existsByJobPost_JobPostId(UUID jobPostId);

    List<Application> findByJobPost_JobPostId(UUID jobPostId);

    long countByStudent_UserIdAndStudent_DeletedAtIsNull(UUID studentId);

    @Query("SELECT a FROM Application a " + "LEFT JOIN FETCH a.jobPost jp "
            + "LEFT JOIN FETCH jp.enterprise "
            + "WHERE a.student.userId = :studentId")
    List<Application> findByStudent_UserId(@Param("studentId") UUID studentId);

    boolean existsByJobPost_Enterprise_EnterpriseIdAndStudent_UserId(UUID enterpriseId, UUID studentId);

    List<Application> findByJobPost_Enterprise_EnterpriseId(UUID enterpriseId);

    List<Application> findByJobPost_Enterprise_EnterpriseIdAndDeletedAtIsNull(UUID enterpriseId);

    @Query("SELECT a FROM Application a " + "LEFT JOIN FETCH a.jobPost jp "
            + "LEFT JOIN FETCH jp.enterprise "
            + "LEFT JOIN FETCH a.student s "
            + "LEFT JOIN s.studentProfile sp "
            + "WHERE jp.enterprise.enterpriseId = :enterpriseId "
            + "AND a.deletedAt IS NULL "
            + "AND (:search IS NULL OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) "
            + "OR LOWER(sp.studentCode) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) "
            + "OR LOWER(jp.title) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')))")
    List<Application> searchByEnterpriseId(@Param("enterpriseId") UUID enterpriseId, @Param("search") String search);

    long countByStudent_UserIdAndStatusNotAndDeletedAtIsNull(UUID studentId, ApplicationStatus status);

    /**
     * Counts active (non-terminal) applications for a single job post.
     * Active = PENDING, SCREENING_PASSED, INTERVIEW_SCHEDULED, ACCEPTED
     * Excludes terminal statuses: REJECTED, SCREENING_REJECTED, WITHDRAWN
     * — withdrawn / rejected applications free up the slot.
     *
     * <p>Used to enforce {@code max_positions}: a job is "full" when this count
     * reaches its positionsCount. Apply is blocked past that point.
     */
    @Query("SELECT COUNT(a) FROM Application a "
            + "WHERE a.jobPost.jobPostId = :jobPostId "
            + "AND a.deletedAt IS NULL "
            + "AND a.status NOT IN ('REJECTED', 'SCREENING_REJECTED', 'WITHDRAWN')")
    long countActiveApplicationsForJob(@Param("jobPostId") UUID jobPostId);

    /**
     * Counts only active (non-terminal) applications for a student.
     * Active = PENDING, SCREENING_PASSED, INTERVIEW_SCHEDULED, ACCEPTED
     * Excludes terminal statuses: REJECTED, SCREENING_REJECTED, WITHDRAWN
     */
    @Query("SELECT COUNT(a) FROM Application a "
            + "WHERE a.student.userId = :studentId "
            + "AND a.deletedAt IS NULL "
            + "AND a.status NOT IN ('REJECTED', 'SCREENING_REJECTED', 'WITHDRAWN')")
    long countActiveApplications(@Param("studentId") UUID studentId);

    void deleteByJobPost_Enterprise_EnterpriseId(UUID enterpriseId);

    @Modifying
    @Query("UPDATE Application a SET a.cvDownloadCount = a.cvDownloadCount + 1 WHERE a.applicationId = :id")
    void incrementDownloadCount(@Param("id") UUID id);

    // BR-26 undo: find all applications that were withdrawn by a given trigger app.
    // Used to revive sibling applications when an enterprise drags ACCEPTED → REJECTED.
    List<Application> findByWithdrawnByApplicationId(UUID withdrawnByApplicationId);
}
