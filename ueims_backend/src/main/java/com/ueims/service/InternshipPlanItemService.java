package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.InternshipPlanItem;

public interface InternshipPlanItemService {
    List<InternshipPlanItem> findAll();

    InternshipPlanItem findById(UUID id);

    InternshipPlanItem save(InternshipPlanItem entity);

    void deleteById(UUID id);
}
