package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.Semester;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.service.JobPostService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobPostServiceImpl implements JobPostService {
    private final JobPostRepository repository;
    private final SemesterRepository semesterRepository;
    private final EnterpriseRepository enterpriseRepository;

    @Override
    public List<JobPost> findAll() {
        return repository.findAll();
    }

    @Override
    public JobPost findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public JobPost save(JobPost entity) {
        if (entity.getSemester() == null || entity.getSemester().getSemesterId() == null) {
            throw new AppException(ErrorCode.SEMESTER_NOT_FOUND);
        }

        Semester semester = semesterRepository
                .findById(entity.getSemester().getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));

        if (!"ACTIVE".equals(semester.getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_NOT_ACTIVE);
        }

        if (entity.getEnterprise() == null || entity.getEnterprise().getEnterpriseId() == null) {
            throw new AppException(ErrorCode.ENTERPRISE_NOT_FOUND);
        }

        Enterprise enterprise = enterpriseRepository
                .findById(entity.getEnterprise().getEnterpriseId())
                .orElseThrow(() -> new AppException(ErrorCode.ENTERPRISE_NOT_FOUND));

        if (!"ACTIVE".equals(enterprise.getStatus())) {
            throw new AppException(ErrorCode.ENTERPRISE_NOT_ACTIVE);
        }

        entity.setSemester(semester);
        entity.setEnterprise(enterprise);
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
