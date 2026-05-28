package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.TrainingWarning;

public interface TrainingWarningService {
    List<TrainingWarning> findAll();

    TrainingWarning findById(UUID id);

    TrainingWarning save(TrainingWarning entity);

    void deleteById(UUID id);
}
