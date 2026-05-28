package com.ueims.service;

import com.ueims.model.entity.Interview;
import java.util.List;
import java.util.UUID;

public interface InterviewService {
    List<Interview> findAll();
    Interview findById(UUID id);
    Interview save(Interview entity);
    void deleteById(UUID id);
}
