package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.service.AtRiskStudentService;
import com.ueims.service.impl.AtRiskStudentResult;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/at-risk-students")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AtRiskStudentController {

    AtRiskStudentService atRiskStudentService;
    com.ueims.service.ExcelExportService excelExportService;

    @GetMapping
    public ResponseEntity<List<AtRiskStudentResult>> getAtRiskStudents(
            @RequestParam UUID semesterId,
            @RequestParam(required = false) String riskCategory,
            @RequestParam(required = false) Integer minPriority) {
        List<AtRiskStudentResult> results =
                atRiskStudentService.getAtRiskStudentsBySemester(semesterId, riskCategory, minPriority);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAtRiskStudents(@RequestParam UUID semesterId) {
        return excelExportService.exportAtRiskStudents(semesterId);
    }
}
