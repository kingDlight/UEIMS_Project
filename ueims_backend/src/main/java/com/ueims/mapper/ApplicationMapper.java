package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.ueims.dto.response.ApplicationResponse;
import com.ueims.model.entity.Application;

@Mapper(componentModel = "spring")
public interface ApplicationMapper {
    @Mapping(source = "jobPost.jobPostId", target = "jobPostId")
    @Mapping(source = "jobPost.title", target = "jobPostTitle")
    @Mapping(source = "jobPost.enterprise.companyName", target = "enterpriseName")
    @Mapping(source = "student.userId", target = "studentId")
    @Mapping(source = "student.fullName", target = "studentName")
    @Mapping(source = "student.email", target = "studentEmail")
    @Mapping(source = "student.studentCode", target = "studentCode")
    ApplicationResponse ptoApplicationResponse(Application application);
}
