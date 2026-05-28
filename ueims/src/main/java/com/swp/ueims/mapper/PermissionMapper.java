package com.swp.ueims.mapper;

import org.mapstruct.Mapper;

import com.swp.ueims.dto.request.PermissionRequest;
import com.swp.ueims.dto.response.PermissionResponse;
import com.swp.ueims.entity.Permission;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
