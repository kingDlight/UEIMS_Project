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

        AtRiskStudentResult result = org.mockito.Mockito.mock(AtRiskStudentResult.class);
        org.mockito.Mockito.lenient().when(result.getStudentCode()).thenReturn("HE12345");
        org.mockito.Mockito.lenient().when(result.getStudentName()).thenReturn("Test Student");
        org.mockito.Mockito.lenient().when(result.getCompanyName()).thenReturn("Test Company");
        org.mockito.Mockito.lenient().when(result.getRiskCategory()).thenReturn("HIGH");
        org.mockito.Mockito.lenient().when(result.getPriorityScore()).thenReturn(80);
        org.mockito.Mockito.lenient().when(result.getMissedReports()).thenReturn(2);
        org.mockito.Mockito.lenient().when(result.getRejectedReports()).thenReturn(1);
        org.mockito.Mockito.lenient().when(result.getRiskReason()).thenReturn("Missed");
        org.mockito.Mockito.lenient().when(result.getDaysAtRisk()).thenReturn(5);

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
