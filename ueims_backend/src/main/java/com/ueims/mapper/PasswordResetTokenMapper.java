package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.PasswordResetTokenDTO;
import com.ueims.model.entity.PasswordResetToken;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface PasswordResetTokenMapper {
    PasswordResetTokenDTO toDto(PasswordResetToken entity);

    PasswordResetToken toEntity(PasswordResetTokenDTO dto);
}
