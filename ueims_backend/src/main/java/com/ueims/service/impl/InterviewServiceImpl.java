package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.Interview;
import com.ueims.repository.InterviewRepository;
import com.ueims.service.InterviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {
    private final InterviewRepository repository;

    @Override
    public List<Interview> findAll() {
        return repository.findAll();
    }

    @Override
    public Interview findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Interview save(Interview entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
