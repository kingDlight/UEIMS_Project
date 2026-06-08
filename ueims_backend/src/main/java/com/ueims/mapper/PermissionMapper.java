package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.PermissionDTO;
import com.ueims.model.entity.Permission;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface PermissionMapper {
    PermissionDTO toDto(Permission entity);

    Permission toEntity(PermissionDTO dto);
}
