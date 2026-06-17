package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface EnterpriseRepository extends JpaRepository<Enterprise, UUID> {
    boolean existsByTaxCode(String taxCode);

    List<Enterprise> findByStatus(String status);
}
