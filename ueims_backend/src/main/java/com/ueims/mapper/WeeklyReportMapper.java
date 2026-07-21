package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.WeeklyReportDTO;
import com.ueims.model.entity.WeeklyReport;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface WeeklyReportMapper {
    @Mapping(target = "assignmentId", source = "assignment.assignmentId")
    @Mapping(target = "studentName", ignore = true)
    @Mapping(target = "studentCode", ignore = true)
    @Mapping(target = "studentEmail", ignore = true)
    @Mapping(target = "enterpriseName", ignore = true)
    @Mapping(target = "weekStartDate", ignore = true)
    @Mapping(target = "weekEndDate", ignore = true)
    WeeklyReportDTO toDto(WeeklyReport entity);

    @Mapping(target = "assignment.assignmentId", source = "assignmentId")
    WeeklyReport toEntity(WeeklyReportDTO dto);
}
