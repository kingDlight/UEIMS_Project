package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.EnterpriseEvaluation;

public interface EnterpriseEvaluationService {
    List<EnterpriseEvaluation> findAll();

    List<EnterpriseEvaluation> findByEnterprise();

    EnterpriseEvaluation findById(UUID id);

    EnterpriseEvaluation findMyEvaluation(UUID studentId);

    EnterpriseEvaluation save(EnterpriseEvaluation entity);

    EnterpriseEvaluation update(UUID id, EnterpriseEvaluation entity);

    void deleteById(UUID id);
}
