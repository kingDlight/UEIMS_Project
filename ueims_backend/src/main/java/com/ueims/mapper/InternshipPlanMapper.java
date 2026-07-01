package com.ueims.mapper;

import org.mapstruct.*;

import com.ueims.dto.response.InternshipPlanDTO;
import com.ueims.model.entity.InternshipPlan;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface InternshipPlanMapper {
    @Mapping(target = "assignmentId", source = "assignment.assignmentId")
    @Mapping(target = "jobPostId", source = "jobPost.jobPostId")
    @Mapping(target = "jobPostTitle", source = "jobPost.title")
    @Mapping(
            target = "enterpriseName",
            expression =
                    "java(entity != null && entity.getAssignment() != null && entity.getAssignment().getEnterprise() != null ? entity.getAssignment().getEnterprise().getCompanyName() : null)")
    @Mapping(
            target = "startDate",
            expression =
                    "java(entity != null && entity.getAssignment() != null && entity.getAssignment().getSemester() != null && entity.getAssignment().getSemester().getStartDate() != null ? entity.getAssignment().getSemester().getStartDate().toString() : null)")
    @Mapping(target = "tasks", source = "items")
    InternshipPlanDTO toDto(InternshipPlan entity);

    @Mapping(target = "assignment.assignmentId", source = "assignmentId")
    InternshipPlan toEntity(InternshipPlanDTO dto);
}
