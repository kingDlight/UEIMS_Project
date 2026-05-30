package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.ueims.dto.request.ApplicationRequest;
import com.ueims.dto.response.ApplicationResponse;
import com.ueims.model.entity.Application;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.User;

@Mapper(componentModel = "spring")
public interface ApplicationMapper {
    @Mapping(source = "jobPost.jobPostId", target = "jobPostId")
    @Mapping(source = "jobPost.title", target = "jobPostTitle")
    @Mapping(source = "jobPost.enterprise.companyName", target = "enterpriseName")
    @Mapping(source = "student.userId", target = "studentId")
    @Mapping(source = "student.fullName", target = "studentName")
    ApplicationResponse toApplicationResponse(Application application);

    @Mapping(target = "applicationId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "screenedBy", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "cvSnapshotUrl", ignore = true)
    @Mapping(target = "jobPost", source = "jobPost")
    @Mapping(target = "student", source = "student")
    Application toApplication(ApplicationRequest request, JobPost jobPost, User student);
}
