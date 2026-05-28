package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.StudentEnterpriseFeedback;
import com.ueims.repository.StudentEnterpriseFeedbackRepository;
import com.ueims.service.StudentEnterpriseFeedbackService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentEnterpriseFeedbackServiceImpl implements StudentEnterpriseFeedbackService {
    private final StudentEnterpriseFeedbackRepository repository;

    @Override
    public List<StudentEnterpriseFeedback> findAll() {
        return repository.findAll();
    }

    @Override
    public StudentEnterpriseFeedback findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public StudentEnterpriseFeedback save(StudentEnterpriseFeedback entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
