package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Interview;

public interface InterviewService {
    List<Interview> findAll();

    Interview findById(UUID id);

    Interview save(Interview entity);

    Interview studentConfirm(UUID id);

    Interview studentDecline(UUID id, String reason);

    Interview decideInterview(UUID id, String result, UUID decidedBy);

    void deleteById(UUID id);
}
