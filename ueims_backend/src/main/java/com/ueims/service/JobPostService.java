package com.ueims.service;

import com.ueims.model.entity.JobPost;
import java.util.List;
import java.util.UUID;

public interface JobPostService {
    List<JobPost> findAll();
    JobPost findById(UUID id);
    JobPost save(JobPost entity);
    void deleteById(UUID id);
}
