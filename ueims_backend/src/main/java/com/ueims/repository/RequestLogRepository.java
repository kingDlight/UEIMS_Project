package com.ueims.repository;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.RequestLog;

@Repository
public interface RequestLogRepository extends JpaRepository<RequestLog, UUID>, JpaSpecificationExecutor<RequestLog> {

    @Modifying
    @Query("DELETE FROM RequestLog r WHERE r.timestamp < :cutoff")
    int deleteByTimestampBefore(@Param("cutoff") LocalDateTime cutoff);

    Page<RequestLog> findByTimestampAfter(LocalDateTime cutoff, Pageable pageable);

    Page<RequestLog> findByUserId(UUID userId, Pageable pageable);

    Page<RequestLog> findByUserIdAndTimestampAfter(UUID userId, LocalDateTime cutoff, Pageable pageable);

    long countByTimestampAfter(LocalDateTime cutoff);
}
