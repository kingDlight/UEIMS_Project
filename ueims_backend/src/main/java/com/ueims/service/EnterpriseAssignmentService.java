package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.response.EnterpriseAssignmentDTO;
import com.ueims.model.entity.EnterpriseAssignment;

public interface EnterpriseAssignmentService {
    List<EnterpriseAssignment> findAll();

    EnterpriseAssignment findById(UUID id);

    List<EnterpriseAssignment> findByEnterpriseId(UUID enterpriseId);

    EnterpriseAssignment findMyAssignment(UUID studentId);

    EnterpriseAssignment save(EnterpriseAssignment entity);

    EnterpriseAssignment update(UUID id, EnterpriseAssignmentDTO dto);

    void deleteById(UUID id);
}
