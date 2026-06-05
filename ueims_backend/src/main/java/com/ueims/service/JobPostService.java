package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.JobPost;

public interface JobPostService {
    List<JobPost> findAll();

    JobPost findById(UUID id);

    JobPost create(com.ueims.dto.request.JobPostRequest request);

    JobPost update(UUID id, com.ueims.dto.request.JobPostRequest request);

    void deleteById(UUID id);
}
