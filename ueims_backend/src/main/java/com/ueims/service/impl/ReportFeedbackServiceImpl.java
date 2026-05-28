package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.ReportFeedback;
import com.ueims.repository.ReportFeedbackRepository;
import com.ueims.service.ReportFeedbackService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportFeedbackServiceImpl implements ReportFeedbackService {
    private final ReportFeedbackRepository repository;

    @Override
    public List<ReportFeedback> findAll() {
        return repository.findAll();
    }

    @Override
    public ReportFeedback findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public ReportFeedback save(ReportFeedback entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
