package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.AtRiskStudent;

@Repository
public interface AtRiskStudentRepository extends JpaRepository<AtRiskStudent, UUID> {
    List<AtRiskStudent> findBySemesterId(UUID semesterId);
}
