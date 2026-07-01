package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.InternshipPlan;

public interface InternshipPlanService {
    List<InternshipPlan> findAll();

    InternshipPlan findById(UUID id);

    InternshipPlan findMyPlan(UUID studentId);

    InternshipPlan findByAssignmentId(UUID assignmentId);

    InternshipPlan findByJobPostId(UUID jobPostId);

    List<InternshipPlan> findPendingMasterPlans();

    InternshipPlan approveMasterPlan(UUID planId);

    InternshipPlan rejectMasterPlan(UUID planId, String reason);

    InternshipPlan save(InternshipPlan entity);

    void deleteById(UUID id);
}
