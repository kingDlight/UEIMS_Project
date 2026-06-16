package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.StudentProfileResponseDTO;
import com.ueims.model.entity.StudentProfile;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface StudentProfileMapper {
    StudentProfileResponseDTO toDto(StudentProfile entity);

    StudentProfile toEntity(StudentProfileResponseDTO dto);
}
