package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.RoleDTO;
import com.ueims.model.entity.Role;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface RoleMapper {
    RoleDTO toDto(Role entity);

    Role toEntity(RoleDTO dto);
}
