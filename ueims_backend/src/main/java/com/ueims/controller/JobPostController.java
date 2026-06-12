package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.response.ApiResponse;
import com.ueims.model.entity.JobPost;
import com.ueims.service.JobPostService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/job-posts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JobPostController {
    JobPostService service;

    @GetMapping
    public ApiResponse<List<JobPost>> getAll() {
        return ApiResponse.<List<JobPost>>builder().result(service.findAll()).build();
    }

    @GetMapping("/active")
    public ApiResponse<List<JobPost>> getActive() {
        return ApiResponse.<List<JobPost>>builder().result(service.findActive()).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<JobPost> getById(@PathVariable UUID id) {
        return ApiResponse.<JobPost>builder().result(service.findById(id)).build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ENTERPRISE')")
    public ApiResponse<JobPost> create(@RequestBody @Valid com.ueims.dto.request.JobPostRequest request) {
        return ApiResponse.<JobPost>builder()
                .result(service.create(request))
                .message("Job posting created successfully")
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ENTERPRISE')")
    public ApiResponse<JobPost> update(
            @PathVariable UUID id, @Valid @RequestBody com.ueims.dto.request.JobPostRequest request) {
        return ApiResponse.<JobPost>builder()
                .result(service.update(id, request))
                .message("Job posting updated successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ENTERPRISE')")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ApiResponse.<Void>builder()
                .message("Job posting deleted successfully")
                .build();
    }
}
