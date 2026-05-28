package com.swp.ueims.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.swp.ueims.entity.Permission;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, String> {}
