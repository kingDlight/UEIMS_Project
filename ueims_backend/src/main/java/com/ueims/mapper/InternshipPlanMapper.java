package com.ueims.mapper;

import org.mapstruct.*;

import com.ueims.dto.response.InternshipPlanDTO;
import com.ueims.model.entity.InternshipPlan;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface InternshipPlanMapper {
    @Mapping(target = "enterpriseName", expression = "java(entity.getAssignment().getEnterprise().getCompanyName())")
    @Mapping(target = "startDate", expression = "java(entity.getAssignment().getSemester().getStartDate().toString())")
    @Mapping(target = "tasks", source = "items")
    InternshipPlanDTO toDto(InternshipPlan entity);

    InternshipPlan toEntity(InternshipPlanDTO dto);
}
