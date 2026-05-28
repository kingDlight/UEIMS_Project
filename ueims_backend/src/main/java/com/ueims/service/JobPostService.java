package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.JobPost;

public interface JobPostService {
    List<JobPost> findAll();

    JobPost findById(UUID id);

    JobPost save(JobPost entity);

    void deleteById(UUID id);
}
