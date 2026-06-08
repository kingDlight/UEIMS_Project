package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.InterviewDTO;
import com.ueims.model.entity.Interview;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface InterviewMapper {
    InterviewDTO toDto(Interview entity);

    Interview toEntity(InterviewDTO dto);
}
