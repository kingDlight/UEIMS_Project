package com.ueims.controller;

import java.util.List;
import java.util.UUID;

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
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.service.ExcelExportService;
import com.ueims.service.FinalGradeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/final-grades")
@RequiredArgsConstructor
public class FinalGradeController {
    private final FinalGradeService service;
    private final ExcelExportService excelExportService;


    @GetMapping
    public ApiResponse<List<FinalGrade>> getAll() {
        return ApiResponse.<List<FinalGrade>>builder().result(service.findAll()).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<FinalGrade> getById(@PathVariable UUID id) {
        return ApiResponse.<FinalGrade>builder().result(service.findById(id)).build();
    }

    @PostMapping
    public ApiResponse<FinalGrade> create(@Valid @RequestBody FinalGradeRequest request) {
        return ApiResponse.<FinalGrade>builder().result(service.create(request)).build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ApiResponse.<Void>builder().build();
    }

     @GetMapping("/export")
    public org.springframework.http.ResponseEntity<byte[]> exportFinalGrades() {
        return excelExportService.exportFinalGrades();
    }
}
