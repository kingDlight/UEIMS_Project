package com.ueims.mapper;

import org.mapstruct.*;

import com.ueims.dto.response.EnterpriseDTO;
import com.ueims.model.entity.Enterprise;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EnterpriseMapper {
    EnterpriseDTO toDto(Enterprise entity);

    Enterprise toEntity(EnterpriseDTO dto);
}
