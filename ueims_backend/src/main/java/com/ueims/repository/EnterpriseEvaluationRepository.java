package com.ueims.repository;

import com.ueims.model.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface EnterpriseEvaluationRepository extends JpaRepository<EnterpriseEvaluation, UUID> {
}
