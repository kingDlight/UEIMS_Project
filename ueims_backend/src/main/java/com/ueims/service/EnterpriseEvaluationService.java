package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.EnterpriseEvaluation;

public interface EnterpriseEvaluationService {
    List<EnterpriseEvaluation> findAll();

    EnterpriseEvaluation findById(UUID id);

    EnterpriseEvaluation findMyEvaluation(UUID studentId);

    EnterpriseEvaluation save(EnterpriseEvaluation entity);

    void deleteById(UUID id);
}
