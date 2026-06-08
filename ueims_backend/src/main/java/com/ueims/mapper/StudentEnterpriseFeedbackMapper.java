package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.StudentEnterpriseFeedbackDTO;
import com.ueims.model.entity.StudentEnterpriseFeedback;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface StudentEnterpriseFeedbackMapper {
    StudentEnterpriseFeedbackDTO toDto(StudentEnterpriseFeedback entity);

    StudentEnterpriseFeedback toEntity(StudentEnterpriseFeedbackDTO dto);
}
