package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.JobPostRequest;
import com.ueims.model.entity.JobPost;

public interface JobPostService {
    List<JobPost> findAll();

    List<JobPost> findActive();

    JobPost findById(UUID id);

    JobPost create(JobPostRequest request);

    JobPost update(UUID id, JobPostRequest request);

    JobPost toggleStatus(UUID id, String status);

    void deleteById(UUID id);
}
