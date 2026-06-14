package com.ueims.mapper;

import org.mapstruct.*;

import com.ueims.dto.response.ApplicationResponse;
import com.ueims.model.entity.Application;
import com.ueims.model.entity.StudentProfile;
import com.ueims.repository.StudentProfileRepository;

import lombok.RequiredArgsConstructor;

@Mapper(
        componentModel = "spring",
        uses = {StudentProfileRepository.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
@RequiredArgsConstructor
public abstract class ApplicationMapper {
    private StudentProfileRepository studentProfileRepository;

    @Mapping(source = "jobPost.jobPostId", target = "jobPostId")
    @Mapping(source = "jobPost.title", target = "jobPostTitle")
    @Mapping(source = "jobPost.enterprise.companyName", target = "enterpriseName")
    @Mapping(source = "student.userId", target = "studentId")
    @Mapping(source = "student.fullName", target = "studentName")
    @Mapping(source = "student.email", target = "studentEmail")
    @Mapping(source = "interviewDate", target = "interviewDate")
    @Mapping(source = "interviewLink", target = "interviewLink")
    public abstract ApplicationResponse toApplicationResponse(Application application);

    @AfterMapping
    protected void afterMapping(Application source, @MappingTarget ApplicationResponse target) {
        if (source.getStudent() != null) {
            StudentProfile profile = studentProfileRepository.findByUser_UserId(
                    source.getStudent().getUserId());
            if (profile != null) {
                target.setStudentCode(profile.getStudentCode());
            }
        }
    }
}
