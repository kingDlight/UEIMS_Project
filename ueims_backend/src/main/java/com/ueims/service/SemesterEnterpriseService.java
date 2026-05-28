package com.ueims.service;

import com.ueims.model.entity.SemesterEnterprise;
import java.util.List;
import java.util.UUID;

public interface SemesterEnterpriseService {
    List<SemesterEnterprise> findAll();
    SemesterEnterprise findById(UUID id);
    SemesterEnterprise save(SemesterEnterprise entity);
    void deleteById(UUID id);
}
