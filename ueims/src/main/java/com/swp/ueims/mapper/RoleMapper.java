package com.swp.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.swp.ueims.dto.request.RoleRequest;
import com.swp.ueims.dto.response.RoleResponse;
import com.swp.ueims.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
