package com.ueims.service;

import com.ueims.model.entity.EnterpriseEvaluation;
import java.util.List;
import java.util.UUID;

public interface EnterpriseEvaluationService {
    List<EnterpriseEvaluation> findAll();
    EnterpriseEvaluation findById(UUID id);
    EnterpriseEvaluation save(EnterpriseEvaluation entity);
    void deleteById(UUID id);
}
