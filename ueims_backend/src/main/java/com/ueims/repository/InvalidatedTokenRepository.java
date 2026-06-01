package com.ueims.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {

    @Modifying
    @Query("DELETE FROM InvalidatedToken t WHERE t.expiresAt < :now")
    void deleteAllByExpiresAtBefore(@Param("now") LocalDateTime now);
}
