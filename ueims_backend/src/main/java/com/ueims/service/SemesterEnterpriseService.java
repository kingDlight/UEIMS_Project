package com.ueims.service;

import com.ueims.model.entity.SemesterEnterprise;
import com.ueims.model.entity.SemesterEnterpriseId;
import java.util.List;

public interface SemesterEnterpriseService {
    List<SemesterEnterprise> findAll();
    SemesterEnterprise findById(SemesterEnterpriseId id);
    SemesterEnterprise save(SemesterEnterprise entity);
    void deleteById(SemesterEnterpriseId id);
}
