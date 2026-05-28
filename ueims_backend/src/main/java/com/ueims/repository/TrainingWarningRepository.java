package com.ueims.repository;

import com.ueims.model.entity.TrainingWarning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface TrainingWarningRepository extends JpaRepository<TrainingWarning, UUID> {
}
