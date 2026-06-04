package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.ApplicationRequest;
import com.ueims.dto.response.ApiResponse;
import com.ueims.dto.response.ApplicationResponse;
import com.ueims.service.ApplicationService;

import lombok.RequiredArgsConstructor;

/**
 * Controller handling Student Job Applications (CV Submissions)
 */
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService service;

    /**
     * Get all job applications
     *
     * @return ApiResponse containing list of application responses
     */
    @GetMapping
    public ApiResponse<List<ApplicationResponse>> getAll() {
        return ApiResponse.<List<ApplicationResponse>>builder()
                .result(service.findAll())
                .build();
    }

    /**
     * Get details of a specific job application
     *
     * @param id Application UUID
     * @return ApiResponse containing the application response DTO
     */
    @GetMapping("/{id}")
    public ApiResponse<ApplicationResponse> getById(@PathVariable UUID id) {
        return ApiResponse.<ApplicationResponse>builder()
                .result(service.findById(id))
                .build();
    }

    /**
     * Submit a new job application (Apply for job with CV)
     * Enforces BR-31 (PDF format, size < 5MB), BR-46 (only 1 active application per job post),
     * and a max of 3 total applications per student.
     *
     * @param request The application details
     * @return ApiResponse containing the created application response DTO
     */
    @PostMapping
    public ApiResponse<ApplicationResponse> applyForJob(@RequestBody @Valid ApplicationRequest request) {
        return ApiResponse.<ApplicationResponse>builder()
                .result(service.applyForJob(request))
                .build();
    }

    /**
     * Delete/Withdraw an application by ID
     *
     * @param id Application UUID
     * @return ApiResponse indicating success
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ApiResponse.<Void>builder().build();
    }

    /**
     * Withdraw a pending job application (UC-57)
     * Enforces BR-48 (withdrawal must be before job posting deadline)
     * 
     * @param id Application UUID
     * @return ApiResponse containing the updated application response with WITHDRAWN status
     */
    @PatchMapping("/{id}/withdraw")
    public ApiResponse<ApplicationResponse> withdrawApplication(@PathVariable UUID id) {
        return ApiResponse.<ApplicationResponse>builder()
                .result(service.withdrawApplication(id))
                .build();
    }
}
