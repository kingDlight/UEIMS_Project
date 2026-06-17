package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.EnterpriseAssignmentResponseDTO;
import com.ueims.model.entity.EnterpriseAssignment;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface EnterpriseAssignmentMapper {
    EnterpriseAssignmentResponseDTO toDto(EnterpriseAssignment entity);

    EnterpriseAssignment toEntity(EnterpriseAssignmentResponseDTO dto);

    void updateEntity(EnterpriseAssignmentResponseDTO dto, @MappingTarget EnterpriseAssignment entity);
}
