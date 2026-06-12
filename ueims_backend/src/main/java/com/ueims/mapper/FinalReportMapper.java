package com.ueims.mapper;

import org.mapstruct.*;

import com.ueims.dto.response.FinalReportDTO;
import com.ueims.model.entity.FinalReport;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface FinalReportMapper {
    @Mapping(
            target = "fileName",
            expression =
                    "java(entity.getFileUrl() == null || entity.getFileUrl().isBlank() ? \"Final_Report.pdf\" : entity.getFileUrl().substring(entity.getFileUrl().lastIndexOf('/') + 1))")
    FinalReportDTO toDto(FinalReport entity);

    FinalReport toEntity(FinalReportDTO dto);
}
