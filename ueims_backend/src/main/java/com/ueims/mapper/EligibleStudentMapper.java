package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.request.EligibleStudentRequest;
import com.ueims.dto.response.EligibleStudentDTO;
import com.ueims.model.entity.EligibleStudent;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface EligibleStudentMapper {
    EligibleStudentDTO toDto(EligibleStudent entity);

    EligibleStudent toEntity(EligibleStudentRequest request);
}
