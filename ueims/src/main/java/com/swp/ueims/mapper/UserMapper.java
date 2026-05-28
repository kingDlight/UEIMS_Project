package com.swp.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.swp.ueims.dto.request.UserCreationRequest;
import com.swp.ueims.dto.request.UserUpdateRequest;
import com.swp.ueims.dto.response.UserResponse;
import com.swp.ueims.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
