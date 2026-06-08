package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.ApplicationRequest;
import com.ueims.dto.request.ApplicationScreenRequest;
import com.ueims.dto.response.ApplicationResponse;

public interface ApplicationService {
    List<ApplicationResponse> findAll();

    List<ApplicationResponse> findMyApplications();

    ApplicationResponse findById(UUID id);

    ApplicationResponse applyForJob(ApplicationRequest request);

    void deleteById(UUID id);

    ApplicationResponse withdrawApplication(UUID applicationId);

    ApplicationResponse screenApplication(UUID id, ApplicationScreenRequest request);
}
