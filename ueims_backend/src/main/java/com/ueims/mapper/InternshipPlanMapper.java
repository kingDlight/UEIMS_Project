package com.ueims.mapper;

import org.mapstruct.*;

import com.ueims.dto.response.InternshipPlanDTO;
import com.ueims.model.entity.InternshipPlan;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface InternshipPlanMapper {
    @Mapping(target = "enterpriseId", source = "enterprise.enterpriseId")
    @Mapping(
            target = "enterpriseName",
            expression =
                    "java(entity != null && entity.getEnterprise() != null ? entity.getEnterprise().getCompanyName() : null)")
    @Mapping(target = "semesterId", source = "semester.semesterId")
    @Mapping(
            target = "semesterCode",
            expression =
                    "java(entity != null && entity.getSemester() != null ? entity.getSemester().getSemesterCode() : null)")
    @Mapping(target = "jobPostId", source = "jobPost.jobPostId")
    @Mapping(
            target = "jobPostTitle",
            expression =
                    "java(entity != null && entity.getJobPost() != null ? entity.getJobPost().getTitle() : null)")
    @Mapping(target = "tasks", source = "items")
    InternshipPlanDTO toDto(InternshipPlan entity);

    @Mapping(target = "enterprise.enterpriseId", source = "enterpriseId")
    @Mapping(target = "semester.semesterId", source = "semesterId")
    @Mapping(target = "jobPost.jobPostId", source = "jobPostId")
    InternshipPlan toEntity(InternshipPlanDTO dto);
}