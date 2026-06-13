package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.request.InternshipPlanItemRequestDTO;
import com.ueims.dto.response.InternshipPlanItemDTO;
import com.ueims.model.entity.InternshipPlanItem;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface InternshipPlanItemMapper {
    InternshipPlanItemDTO toDto(InternshipPlanItem entity);

    InternshipPlanItem toEntity(InternshipPlanItemDTO dto);

    @org.mapstruct.Mapping(target = "plan.planId", source = "planId")
    @org.mapstruct.Mapping(target = "orderIndex", source = "orderIndex", defaultValue = "0")
    InternshipPlanItem toEntity(InternshipPlanItemRequestDTO dto);
}
