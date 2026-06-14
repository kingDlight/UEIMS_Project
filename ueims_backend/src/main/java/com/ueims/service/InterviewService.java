package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Interview;

public interface InterviewService {
    List<Interview> findAll();

    List<Interview> findMyInterviews();

    List<Interview> findMyEnterpriseInterviews();

    Interview findById(UUID id);

    Interview save(Interview entity);

    Interview update(UUID id, Interview entity);

    Interview confirmAttendance(UUID id);

    Interview declineAttendance(UUID id, String reason);

    Interview recordResult(UUID id, String result, String notes);

    Interview cancel(UUID id, String reason);

    Interview reschedule(UUID id, java.time.LocalDateTime newTime, String reason);

    /** Propose 3 open time slots for the next 7 business days that don't overlap existing interviews. */
    List<java.time.LocalDateTime> proposeSlots(UUID applicationId);

    void deleteById(UUID id);
}
