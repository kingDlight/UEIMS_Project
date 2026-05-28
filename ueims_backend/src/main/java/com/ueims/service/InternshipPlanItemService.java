package com.ueims.service;

import com.ueims.model.entity.InternshipPlanItem;
import java.util.List;
import java.util.UUID;

public interface InternshipPlanItemService {
    List<InternshipPlanItem> findAll();
    InternshipPlanItem findById(UUID id);
    InternshipPlanItem save(InternshipPlanItem entity);
    void deleteById(UUID id);
}
