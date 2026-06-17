package com.ueims.mapper;

import org.mapstruct.*;

import com.ueims.dto.response.ApplicationResponse;
import com.ueims.model.entity.Application;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ApplicationMapper {

    @Mapping(source = "jobPost.jobPostId", target = "jobPostId")
    @Mapping(source = "jobPost.title", target = "jobPostTitle")
    @Mapping(source = "jobPost.enterprise.companyName", target = "enterpriseName")
    @Mapping(source = "student.userId", target = "studentId")
    @Mapping(source = "student.fullName", target = "studentName")
    @Mapping(source = "student.email", target = "studentEmail")
    @Mapping(source = "interviewDate", target = "interviewDate")
    @Mapping(source = "interviewLink", target = "interviewLink")
    @Mapping(source = "cvDownloadCount", target = "cvDownloadCount")
    ApplicationResponse toApplicationResponse(Application application);
}
