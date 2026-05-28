package com.ueims.service;

import com.ueims.model.entity.TrainingWarning;
import java.util.List;
import java.util.UUID;

public interface TrainingWarningService {
    List<TrainingWarning> findAll();
    TrainingWarning findById(UUID id);
    TrainingWarning save(TrainingWarning entity);
    void deleteById(UUID id);
}
