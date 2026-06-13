package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.EnterpriseAssignment;

public interface EnterpriseAssignmentService {
    List<EnterpriseAssignment> findAll();

    EnterpriseAssignment findById(UUID id);

    EnterpriseAssignment findMyAssignment(UUID studentId);

    EnterpriseAssignment save(EnterpriseAssignment entity);

    void deleteById(UUID id);
}
