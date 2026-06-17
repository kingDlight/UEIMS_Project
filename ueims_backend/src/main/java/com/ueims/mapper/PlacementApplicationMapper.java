package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.PlacementApplicationResponseDTO;
import com.ueims.model.entity.PlacementApplication;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface PlacementApplicationMapper {

    @Mapping(source = "student.userId", target = "studentId")
    @Mapping(source = "student.fullName", target = "studentName")
    @Mapping(source = "student.studentProfile.studentCode", target = "studentCode")
    @Mapping(source = "student.studentProfile.major", target = "major")
    @Mapping(source = "enterprise.enterpriseId", target = "enterpriseId")
    @Mapping(source = "enterprise.companyName", target = "enterpriseName")
    @Mapping(source = "semester.semesterId", target = "semesterId")
    @Mapping(source = "semester.semesterCode", target = "semesterCode")
    @Mapping(source = "reviewedBy.userId", target = "reviewedBy")
    @Mapping(source = "reviewedBy.fullName", target = "reviewedByName")
    PlacementApplicationResponseDTO toDto(PlacementApplication entity);
}