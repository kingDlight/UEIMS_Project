package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.JobPost;
import com.ueims.repository.JobPostRepository;
import com.ueims.service.JobPostService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobPostServiceImpl implements JobPostService {
    private final JobPostRepository repository;

    @Override
    public List<JobPost> findAll() {
        return repository.findAll();
    }

    @Override
    public JobPost findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public JobPost save(JobPost entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
