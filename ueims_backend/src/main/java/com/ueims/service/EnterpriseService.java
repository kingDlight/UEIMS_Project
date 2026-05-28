package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Enterprise;

public interface EnterpriseService {
    List<Enterprise> findAll();

    Enterprise findById(UUID id);

    Enterprise save(Enterprise entity);

    void deleteById(UUID id);
}
