package com.ueims.mapper;

import org.mapstruct.Mapper;

import com.ueims.dto.response.EnterpriseDTO;
import com.ueims.model.entity.Enterprise;

@Mapper(componentModel = "spring")
public interface EnterpriseMapper {
    EnterpriseDTO toDto(Enterprise entity);

    Enterprise toEntity(EnterpriseDTO dto);
}
