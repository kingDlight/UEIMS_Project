package com.ueims.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface SemesterEnterpriseRepository extends JpaRepository<SemesterEnterprise, SemesterEnterpriseId> {
    void deleteById_EnterpriseId(java.util.UUID enterpriseId);
}
