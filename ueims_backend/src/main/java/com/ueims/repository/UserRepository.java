package com.ueims.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.model.entity.*;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByEnterprise_EnterpriseId(UUID enterpriseId);

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles ur JOIN ur.role r "
            + "WHERE UPPER(r.roleName) = UPPER(:roleName) "
            + "AND (u.deletedAt IS NULL) "
            + "AND (u.status IS NULL OR UPPER(u.status) <> 'DISABLED')")
    List<User> findActiveUsersByRoleName(@Param("roleName") String roleName);

    @Modifying
    @Transactional
    @Query(
            "UPDATE User u SET u.failedLoginAttempts = :attempts, u.status = :status, u.lockedUntil = :lockedUntil WHERE u.userId = :userId")
    void updateLoginAttemptsAndStatus(
            @Param("userId") UUID userId,
            @Param("attempts") int attempts,
            @Param("status") String status,
            @Param("lockedUntil") java.time.LocalDateTime lockedUntil);
}
