package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Interview;

public interface InterviewService {
    List<Interview> findAll();

    List<Interview> findMyInterviews();

    Interview findById(UUID id);

    Interview save(Interview entity);

    Interview confirmAttendance(UUID id);

    Interview declineAttendance(UUID id, String reason);

    Interview recordResult(UUID id, String result, String feedback);

    void deleteById(UUID id);
}
