package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.response.EnterpriseAssignmentResponseDTO;
import com.ueims.model.entity.EnterpriseAssignment;

public interface EnterpriseAssignmentService {
    List<EnterpriseAssignment> findAll();

    EnterpriseAssignment findById(UUID id);

    List<EnterpriseAssignment> findByEnterpriseId(UUID enterpriseId);

    EnterpriseAssignment findMyAssignment(UUID studentId);

    List<EnterpriseAssignment> findMyEnterpriseAssignments();

    List<EnterpriseAssignment> searchMyEnterpriseAssignments(String keyword);

    EnterpriseAssignment save(EnterpriseAssignment entity);

    EnterpriseAssignment update(UUID id, EnterpriseAssignmentResponseDTO dto);

    void deleteById(UUID id);

    /**
     * Auto-complete tất cả assignment ACTIVE cũ (khác semester_id) của SV khi SV đã có assignment ACTIVE mới.
     * Dùng khi SV lên kỳ mới và đã được nhận ở DN mới qua interview/manual match.
     *
     * @param studentId        SV đang được assign
     * @param newSemesterId    Semester của assignment mới (sẽ không bị complete)
     * @return Số assignment đã được auto-complete
     */
    int autoCompletePriorActiveAssignments(UUID studentId, UUID newSemesterId);
}
