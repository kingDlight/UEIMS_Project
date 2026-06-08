package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.ReportFeedbackDTO;
import com.ueims.model.entity.ReportFeedback;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface ReportFeedbackMapper {
    ReportFeedbackDTO toDto(ReportFeedback entity);

    ReportFeedback toEntity(ReportFeedbackDTO dto);
}
