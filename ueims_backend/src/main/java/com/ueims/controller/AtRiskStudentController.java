package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.model.entity.AtRiskStudent;
import com.ueims.service.AtRiskStudentService;

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
    public ResponseEntity<List<AtRiskStudent>> getAtRiskStudents(@RequestParam UUID semesterId) {
        List<AtRiskStudent> atRiskStudents = atRiskStudentService.getAtRiskStudentsBySemester(semesterId);
        return ResponseEntity.ok(atRiskStudents);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAtRiskStudents(@RequestParam UUID semesterId) {
        return excelExportService.exportAtRiskStudents(semesterId);
    }
}
