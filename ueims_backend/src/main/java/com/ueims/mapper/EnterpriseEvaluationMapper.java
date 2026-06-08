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
    EnterpriseEvaluationDTO toDto(EnterpriseEvaluation entity);

    EnterpriseEvaluation toEntity(EnterpriseEvaluationDTO dto);
}
