package com.ueims.service;

import java.util.UUID;

import org.springframework.http.ResponseEntity;

public interface ExcelExportService {
    ResponseEntity<byte[]> exportAtRiskStudents(UUID semesterId);

    ResponseEntity<byte[]> exportFinalGrades();

    ResponseEntity<byte[]> exportFinalGradesPdf();
}
