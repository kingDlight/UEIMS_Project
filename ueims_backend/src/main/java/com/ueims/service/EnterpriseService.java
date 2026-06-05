package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Enterprise;

public interface EnterpriseService {
    List<Enterprise> findAll();

    Enterprise findById(UUID id);

    Enterprise save(com.ueims.dto.request.EnterpriseRequest request);

    Enterprise update(UUID id, com.ueims.dto.request.EnterpriseRequest request);

    Enterprise approveReject(UUID id, String status, String reason);

    void deleteById(UUID id);
}
