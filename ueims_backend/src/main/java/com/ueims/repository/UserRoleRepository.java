package com.ueims.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    long countByUserUserId(UUID userId);

    @Query("SELECT COUNT(ur) FROM UserRole ur WHERE ur.id.roleName = :roleName")
    long countByRoleName(@Param("roleName") String roleName);

    @Query("SELECT COUNT(ur) > 0 FROM UserRole ur WHERE ur.user.userId = :userId AND ur.id.roleName = :roleName")
    boolean existsByUserIdAndRoleName(@Param("userId") UUID userId, @Param("roleName") String roleName);
}
