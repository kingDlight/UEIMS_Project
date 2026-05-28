package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.EligibleStudent;

public interface EligibleStudentService {
    List<EligibleStudent> findAll();

    EligibleStudent findById(UUID id);

    EligibleStudent save(EligibleStudent entity);

    void deleteById(UUID id);
}
