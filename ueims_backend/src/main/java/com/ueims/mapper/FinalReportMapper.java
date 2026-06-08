package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.FinalReportDTO;
import com.ueims.model.entity.FinalReport;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface FinalReportMapper {
    FinalReportDTO toDto(FinalReport entity);

    FinalReport toEntity(FinalReportDTO dto);
}
