package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.dto.request.FinalGradeRequest;
import com.ueims.dto.response.ApiResponse;
import com.ueims.model.entity.FinalGrade;
import com.ueims.service.ExcelExportService;
import com.ueims.service.FinalGradeService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/final-grades")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FinalGradeController {
    FinalGradeService service;
    ExcelExportService excelExportService;

    @GetMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public ApiResponse<List<FinalGrade>> getAll() {
        return ApiResponse.<List<FinalGrade>>builder().result(service.findAll()).build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public ApiResponse<FinalGrade> getById(@PathVariable UUID id) {
        return ApiResponse.<FinalGrade>builder().result(service.findById(id)).build();
    }

    @PostMapping
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public ApiResponse<FinalGrade> create(@Valid @RequestBody FinalGradeRequest request) {
        return ApiResponse.<FinalGrade>builder().result(service.create(request)).build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public org.springframework.http.ResponseEntity<byte[]> exportFinalGrades() {
        return excelExportService.exportFinalGrades();
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    public org.springframework.http.ResponseEntity<byte[]> exportFinalGradesPdf() {
        return excelExportService.exportFinalGradesPdf();
    }
}
