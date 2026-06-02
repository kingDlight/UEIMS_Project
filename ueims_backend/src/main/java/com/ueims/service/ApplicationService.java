package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.ApplicationRequest;
import com.ueims.dto.response.ApplicationResponse;

public interface ApplicationService {
    List<ApplicationResponse> findAll();

    ApplicationResponse findById(UUID id);

    ApplicationResponse applyForJob(ApplicationRequest request);

    ApplicationResponse withdrawApplication(UUID id);

    void deleteById(UUID id);
}
