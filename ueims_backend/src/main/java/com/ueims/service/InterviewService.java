package com.ueims.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.InterviewRequest;
import com.ueims.model.entity.Interview;

public interface InterviewService {
    List<Interview> findAll();

    List<Interview> findMyInterviews();

    List<Interview> findMyEnterpriseInterviews();

    Interview findById(UUID id);

    Interview save(Interview entity);

    Interview create(InterviewRequest request);

    Interview update(UUID id, Interview entity);

    Interview confirmAttendance(UUID id);

    Interview declineAttendance(UUID id, String reason);

    Interview recordResult(UUID id, String result, String notes);

    Interview cancel(UUID id, String reason);

    Interview reschedule(UUID id, LocalDateTime newTime, String reason, String meetingLink, String location);

    /**
     * Demo-mode only: move an interview's scheduled_datetime into the past so the
     * "record result" flow can be exercised without waiting for real time. Stamps
     * audit fields (is_backdated/backdated_at/backdated_by/backdated_reason) so the
     * BR-35 trigger accepts the UPDATE. Refuses with AppException unless
     * {@code app.interview.demo-mode=true}.
     */
    Interview backdateSchedule(UUID id, LocalDateTime newTime, String reason);

    /** Propose 3 open time slots for the next 7 business days that don't overlap existing interviews. */
    List<java.time.LocalDateTime> proposeSlots(UUID applicationId);

    void deleteById(UUID id);
}
