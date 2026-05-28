package com.ueims.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {}
