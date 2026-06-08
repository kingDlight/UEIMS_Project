package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.EnterpriseRequest;
import com.ueims.model.entity.Enterprise;

public interface EnterpriseService {
    List<Enterprise> findAll();

    Enterprise findById(UUID id);

    Enterprise save(EnterpriseRequest request);

    Enterprise update(UUID id, EnterpriseRequest request);

    Enterprise approveReject(UUID id, String status, String reason);

    void deleteById(UUID id);
}
