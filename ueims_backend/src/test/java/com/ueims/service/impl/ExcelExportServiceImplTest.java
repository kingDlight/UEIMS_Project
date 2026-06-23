package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;

import com.ueims.model.entity.FinalGrade;
import com.ueims.model.entity.User;
import com.ueims.repository.FinalGradeRepository;
import com.ueims.service.AtRiskStudentService;

@ExtendWith(MockitoExtension.class)
class ExcelExportServiceImplTest {

    @Mock
    private AtRiskStudentService atRiskStudentService;

    @Mock
    private FinalGradeRepository finalGradeRepository;

    @InjectMocks
    private ExcelExportServiceImpl service;

    @Test
    void exportAtRiskStudents_success() {
        UUID semesterId = UUID.randomUUID();

        AtRiskStudentResult result = AtRiskStudentResult.builder()
                .studentCode("HE12345")
                .studentName("Test Student")
                .companyName("Test Company")
                .riskCategory("HIGH")
                .priorityScore(80)
                .missedReports(2)
                .rejectedReports(1)
                .riskReason("Missed")
                .daysAtRisk(5)
                .build();

        when(atRiskStudentService.getAtRiskStudentsBySemester(eq(semesterId))).thenReturn(List.of(result));

        ResponseEntity<byte[]> response = service.exportAtRiskStudents(semesterId);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().length > 0);
        assertEquals(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                response.getHeaders().getContentType().toString());
    }

    @Test
    void exportFinalGrades_success() {
        User studentUser = new User();
        studentUser.setFullName("Test Student");

        FinalGrade grade = new FinalGrade();
        grade.setStudent(studentUser);
        grade.setGradeValue(new BigDecimal("8.5"));
        grade.setOverallStatus("PASS");

        when(finalGradeRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(grade)));

        ResponseEntity<byte[]> response = service.exportFinalGrades();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().length > 0);
        assertEquals(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                response.getHeaders().getContentType().toString());
    }
}
