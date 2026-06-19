package com.ueims.mapper;

import org.mapstruct.*;

import com.ueims.dto.response.InterviewDTO;
import com.ueims.model.entity.Interview;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface InterviewMapper {
    @Mapping(
            target = "enterpriseName",
            expression = "java(entity.getApplication().getJobPost().getEnterprise().getCompanyName())")
    @Mapping(target = "jobTitle", expression = "java(entity.getApplication().getJobPost().getTitle())")
    @Mapping(target = "studentName", expression = "java(entity.getApplication().getStudent().getFullName())")
    InterviewDTO toDto(Interview entity);

    Interview toEntity(InterviewDTO dto);
}
