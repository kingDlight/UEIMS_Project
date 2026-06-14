package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.request.ApplicationRequest;
import com.ueims.dto.request.ApplicationScreenRequest;
import com.ueims.dto.request.ApplicationStatusUpdateRequest;
import com.ueims.dto.response.ApiResponse;
import com.ueims.dto.response.ApplicationResponse;
import com.ueims.service.ApplicationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Controller handling Student Job Applications (CV Submissions)
 */
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationController {
    ApplicationService service;

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
     * Get all job applications of the currently logged in student (UC-55)
     *
     * @return ApiResponse containing list of application responses
     */
    @GetMapping("/my-history")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<List<ApplicationResponse>> getMyApplications() {
        return ApiResponse.<List<ApplicationResponse>>builder()
                .result(service.findMyApplications())
                .build();
    }

    /**
     * Get all applications for the enterprise of the currently logged-in user (UC-41 Kanban)
     */
    @GetMapping("/my-enterprise")
    @PreAuthorize("hasRole('ENTERPRISE') or hasRole('TRAINING_MANAGER')")
    public ApiResponse<List<ApplicationResponse>> getMyEnterpriseApplications() {
        return ApiResponse.<List<ApplicationResponse>>builder()
                .result(service.findByEnterpriseId(null))
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
     * Screen a job application (CV Screening)
     * Transitions the application to SCREENING_PASSED or SCREENING_REJECTED.
     *
     * @param id Application UUID
     * @param request The screening result (status and reason)
     * @return ApiResponse containing the updated application details
     */
    @PutMapping("/{id}/screen")
    @PreAuthorize("hasRole('ENTERPRISE')")
    public ApiResponse<ApplicationResponse> screenApplication(
            @PathVariable UUID id, @RequestBody @Valid ApplicationScreenRequest request) {
        return ApiResponse.<ApplicationResponse>builder()
                .result(service.screenApplication(id, request))
                .build();
    }

    /**
     * Update application status (UC-41 Kanban)
     * Enterprise moves student through PENDING → INTERVIEW_SCHEDULED → ACCEPTED / REJECTED
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ENTERPRISE')")
    public ApiResponse<ApplicationResponse> updateStatus(
            @PathVariable UUID id, @RequestBody @Valid ApplicationStatusUpdateRequest request) {
        return ApiResponse.<ApplicationResponse>builder()
                .result(service.updateStatus(id, request))
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
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<ApplicationResponse> withdrawApplication(@PathVariable UUID id) {
        return ApiResponse.<ApplicationResponse>builder()
                .result(service.withdrawApplication(id))
                .build();
    }
}
