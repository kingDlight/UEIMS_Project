package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.EnterpriseRequest;
import com.ueims.model.entity.Enterprise;

public interface EnterpriseService {
    List<Enterprise> findAll(String industry, String status, String sortBy, String sortDirection);

    Enterprise findById(UUID id);

    Enterprise getMyEnterpriseProfile();

    Enterprise save(EnterpriseRequest request);

    Enterprise update(UUID id, EnterpriseRequest request);

    /**
     * UC-36: edit the currently authenticated Enterprise's own profile.
     * Convenience method that derives the target id from the security context,
     * so callers don't have to pass (and can't spoof) the enterprise id.
     */
    Enterprise updateMyProfile(EnterpriseRequest request);

    Enterprise approveReject(UUID id, String status, String reason);

    void deleteById(UUID id);
}
