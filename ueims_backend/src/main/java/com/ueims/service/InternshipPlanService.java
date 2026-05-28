package com.ueims.service;

import com.ueims.model.entity.InternshipPlan;
import java.util.List;
import java.util.UUID;

public interface InternshipPlanService {
    List<InternshipPlan> findAll();
    InternshipPlan findById(UUID id);
    InternshipPlan save(InternshipPlan entity);
    void deleteById(UUID id);
}
