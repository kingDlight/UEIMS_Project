package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Application;
import com.ueims.model.entity.EnterpriseAssignment;

public interface EnterpriseAssignmentService {
    List<EnterpriseAssignment> findAll();

    EnterpriseAssignment findById(UUID id);

    EnterpriseAssignment findMyAssignment(UUID studentId);

    List<EnterpriseAssignment> findMyEnterpriseAssignments();

    EnterpriseAssignment save(EnterpriseAssignment entity);

    EnterpriseAssignment createAssignmentFromApplication(Application application);

    boolean isStudentAssignedInSemester(UUID studentId, UUID semesterId);

    void deleteById(UUID id);
}
