package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.InvalidatedTokenDTO;
import com.ueims.model.entity.InvalidatedToken;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface InvalidatedTokenMapper {
    InvalidatedTokenDTO toDto(InvalidatedToken entity);

    InvalidatedToken toEntity(InvalidatedTokenDTO dto);
}
