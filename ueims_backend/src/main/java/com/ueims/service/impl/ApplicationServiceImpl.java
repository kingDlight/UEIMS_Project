package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.ApplicationRequest;
import com.ueims.dto.response.ApplicationResponse;
import com.ueims.mapper.ApplicationMapper;
import com.ueims.model.entity.Application;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.User;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.ApplicationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {
    private final ApplicationRepository repository;
    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;
    private final ApplicationMapper applicationMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> findAll() {
        return repository.findAll().stream()
                .map(applicationMapper::toApplicationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse findById(UUID id) {
        return repository
                .findById(id)
                .map(applicationMapper::toApplicationResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public ApplicationResponse save(ApplicationRequest request) {
        JobPost jobPost = jobPostRepository
                .findById(request.getJobPostId())
                .orElseThrow(() -> new RuntimeException("JobPost not found"));
        User student = userRepository
                .findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Application application = applicationMapper.toApplication(request, jobPost, student);
        Application saved = repository.save(application);
        return applicationMapper.toApplicationResponse(saved);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
