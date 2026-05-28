package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.EnterpriseEvaluation;
import com.ueims.repository.EnterpriseEvaluationRepository;
import com.ueims.service.EnterpriseEvaluationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnterpriseEvaluationServiceImpl implements EnterpriseEvaluationService {
    private final EnterpriseEvaluationRepository repository;

    @Override
    public List<EnterpriseEvaluation> findAll() {
        return repository.findAll();
    }

    @Override
    public EnterpriseEvaluation findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public EnterpriseEvaluation save(EnterpriseEvaluation entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
