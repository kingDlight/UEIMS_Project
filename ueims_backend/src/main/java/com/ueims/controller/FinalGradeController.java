package com.ueims.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

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
        FinalGrade entity = new FinalGrade();
        entity.setEnterpriseTotalScore(request.getEnterpriseTotalScore());
        // Determine final grade: use provided finalGrade if present, otherwise derive from enterpriseTotalScore
        BigDecimal finalGrade = request.getFinalGrade();
        if (finalGrade == null) {
            finalGrade = request.getEnterpriseTotalScore();
        }
        if (finalGrade == null) {
            finalGrade = BigDecimal.ZERO;
        }

        // Round to 1 decimal place to match DB precision
        finalGrade = finalGrade.setScale(1, RoundingMode.HALF_UP);
        entity.setGradeValue(finalGrade);

        // Compute overall status based on threshold: >= 5.0 => PASS, otherwise FAIL
        BigDecimal passThreshold = new BigDecimal("5.0");
        String overallStatus = finalGrade.compareTo(passThreshold) >= 0 ? "PASS" : "FAIL";
        entity.setOverallStatus(overallStatus);

        if (request.getStudentId() != null) {
            User student = new User();
            student.setUserId(request.getStudentId());
            entity.setStudent(student);
        }

        if (request.getTmId() != null) {
            User tm = new User();
            tm.setUserId(request.getTmId());
            entity.setTm(tm);
        }

        if (request.getSemesterId() != null) {
            Semester semester = new Semester();
            semester.setSemesterId(request.getSemesterId());
            entity.setSemester(semester);
        }

        return ApiResponse.<FinalGrade>builder().result(service.save(entity)).build();
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
