package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.EnterpriseAssignmentDTO;
import com.ueims.model.entity.EnterpriseAssignment;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface EnterpriseAssignmentMapper {
    EnterpriseAssignmentDTO toDto(EnterpriseAssignment entity);

    EnterpriseAssignment toEntity(EnterpriseAssignmentDTO dto);

    void updateEntity(EnterpriseAssignmentDTO dto, @MappingTarget EnterpriseAssignment entity);
}
