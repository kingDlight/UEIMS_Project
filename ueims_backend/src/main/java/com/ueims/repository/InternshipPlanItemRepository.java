package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.InternshipPlanItem;

@Repository
public interface InternshipPlanItemRepository extends JpaRepository<InternshipPlanItem, UUID> {
    List<InternshipPlanItem> findByPlan_PlanId(UUID planId);

    void deleteByPlan_PlanIdIn(List<UUID> planIds);
}
