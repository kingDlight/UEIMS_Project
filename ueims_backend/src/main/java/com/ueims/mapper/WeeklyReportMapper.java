package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.WeeklyReportDTO;
import com.ueims.model.entity.WeeklyReport;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface WeeklyReportMapper {
    WeeklyReportDTO toDto(WeeklyReport entity);

    WeeklyReport toEntity(WeeklyReportDTO dto);
}
