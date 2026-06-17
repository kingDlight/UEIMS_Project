package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.EnterpriseEvaluationDTO;
import com.ueims.model.entity.EnterpriseEvaluation;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface EnterpriseEvaluationMapper {
    @org.mapstruct.Mapping(source = "assignment.assignmentId", target = "assignmentId")
    EnterpriseEvaluationDTO toDto(EnterpriseEvaluation entity);

    @org.mapstruct.Mapping(source = "assignmentId", target = "assignment.assignmentId")
    EnterpriseEvaluation toEntity(EnterpriseEvaluationDTO dto);
}
