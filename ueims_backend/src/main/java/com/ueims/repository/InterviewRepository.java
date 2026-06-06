package com.ueims.repository;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, UUID> {

    @Query("SELECT COUNT(i) > 0 FROM Interview i "
            + "WHERE i.application.jobPost.enterprise.enterpriseId = :enterpriseId "
            + "AND i.scheduledTime = :scheduledTime")
    boolean existsByEnterpriseAndTime(
            @Param("enterpriseId") UUID enterpriseId, @Param("scheduledTime") LocalDateTime scheduledTime);
}
