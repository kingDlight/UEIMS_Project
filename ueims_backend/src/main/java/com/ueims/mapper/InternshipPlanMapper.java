package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.InternshipPlanDTO;
import com.ueims.model.entity.InternshipPlan;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface InternshipPlanMapper {
    InternshipPlanDTO toDto(InternshipPlan entity);

    InternshipPlan toEntity(InternshipPlanDTO dto);
}
