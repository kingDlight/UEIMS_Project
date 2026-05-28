package com.ueims.service;

import com.ueims.model.entity.Enterprise;
import java.util.List;
import java.util.UUID;

public interface EnterpriseService {
    List<Enterprise> findAll();
    Enterprise findById(UUID id);
    Enterprise save(Enterprise entity);
    void deleteById(UUID id);
}
