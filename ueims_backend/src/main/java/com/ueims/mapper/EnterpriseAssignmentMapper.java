package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.EnterpriseAssignmentResponseDTO;
import com.ueims.model.entity.EnterpriseAssignment;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface EnterpriseAssignmentMapper {
    @org.mapstruct.Mapping(source = "student.fullName", target = "studentName")
    @org.mapstruct.Mapping(source = "student.studentProfile.studentCode", target = "studentCode")
    @org.mapstruct.Mapping(source = "student.email", target = "studentEmail")
    @org.mapstruct.Mapping(source = "student.studentProfile.major", target = "major")
    @org.mapstruct.Mapping(source = "enterprise.companyName", target = "enterpriseName")
    @org.mapstruct.Mapping(source = "semester.semesterCode", target = "semesterCode")
    @org.mapstruct.Mapping(source = "supervisorName", target = "supervisorName")
    @org.mapstruct.Mapping(source = "supervisorEmail", target = "supervisorEmail")
    @org.mapstruct.Mapping(source = "supervisorPhone", target = "supervisorPhone")
    EnterpriseAssignmentResponseDTO toDto(EnterpriseAssignment entity);

    EnterpriseAssignment toEntity(EnterpriseAssignmentResponseDTO dto);

    void updateEntity(EnterpriseAssignmentResponseDTO dto, @MappingTarget EnterpriseAssignment entity);
}
