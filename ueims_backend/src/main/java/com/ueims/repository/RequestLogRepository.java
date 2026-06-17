package com.ueims.repository;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.RequestLog;
import com.ueims.model.entity.RequestLog.HttpMethod;

@Repository
public interface RequestLogRepository extends JpaRepository<RequestLog, UUID> {

    @Modifying
    @Query("DELETE FROM RequestLog r WHERE r.timestamp < :cutoff")
    int deleteByTimestampBefore(@Param("cutoff") LocalDateTime cutoff);

    Page<RequestLog> findByTimestampAfter(LocalDateTime cutoff, Pageable pageable);

    Page<RequestLog> findByUserId(UUID userId, Pageable pageable);

    Page<RequestLog> findByUserIdAndTimestampAfter(UUID userId, LocalDateTime cutoff, Pageable pageable);

    @Query(
            """
		SELECT r FROM RequestLog r
		WHERE (:userId IS NULL OR r.userId = :userId)
		AND (:method IS NULL OR r.method = :method)
		AND (:endpoint IS NULL OR r.endpoint LIKE :endpoint)
		AND (:startDate IS NULL OR r.timestamp >= :startDate)
		AND (:endDate IS NULL OR r.timestamp <= :endDate)
		ORDER BY r.timestamp DESC
		""")
    Page<RequestLog> searchLogs(
            @Param("userId") UUID userId,
            @Param("method") HttpMethod method,
            @Param("endpoint") String endpoint,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    long countByTimestampAfter(LocalDateTime cutoff);
}
