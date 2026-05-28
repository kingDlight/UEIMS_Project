package com.ueims.service;

import com.ueims.model.entity.EligibleStudent;
import java.util.List;
import java.util.UUID;

public interface EligibleStudentService {
    List<EligibleStudent> findAll();
    EligibleStudent findById(UUID id);
    EligibleStudent save(EligibleStudent entity);
    void deleteById(UUID id);
}
