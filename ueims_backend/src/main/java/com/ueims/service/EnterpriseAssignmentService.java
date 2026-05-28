package com.ueims.service;

import com.ueims.model.entity.EnterpriseAssignment;
import java.util.List;
import java.util.UUID;

public interface EnterpriseAssignmentService {
    List<EnterpriseAssignment> findAll();
    EnterpriseAssignment findById(UUID id);
    EnterpriseAssignment save(EnterpriseAssignment entity);
    void deleteById(UUID id);
}
