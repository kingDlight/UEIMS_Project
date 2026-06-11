package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.dto.request.FinalGradeRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.FinalGrade;
import com.ueims.repository.FinalGradeRepository;

@ExtendWith(MockitoExtension.class)
class FinalGradeServiceImplTest {

    @Mock
    private FinalGradeRepository repository;

    @InjectMocks
    private FinalGradeServiceImpl service;

    private FinalGrade finalGrade;
    private UUID gradeId;

    @BeforeEach
    void setUp() {
        gradeId = UUID.randomUUID();
        finalGrade = new FinalGrade();
        finalGrade.setGradeId(gradeId);
        finalGrade.setEnterpriseTotalScore(new BigDecimal("8.5"));
        finalGrade.setGradeValue(new BigDecimal("9.0"));
        finalGrade.setOverallStatus("PASS");
    }

    @Test
    void findAll_returnsList() {
        when(repository.findAll()).thenReturn(List.of(finalGrade));
        List<FinalGrade> result = service.findAll();
        assertEquals(1, result.size());
    }

    @Test
    void findById_exists_returnsFinalGrade() {
        when(repository.findById(gradeId)).thenReturn(Optional.of(finalGrade));
        FinalGrade result = service.findById(gradeId);
        assertNotNull(result);
        assertEquals(gradeId, result.getGradeId());
    }

    @Test
    void findById_notExists_throwsException() {
        when(repository.findById(any())).thenReturn(Optional.empty());
        UUID id = UUID.randomUUID();
        AppException e = assertThrows(AppException.class, () -> service.findById(id));
        assertEquals(ErrorCode.FINAL_GRADE_NOT_FOUND, e.getErrorCode());
    }

    @Test
    void create_withFinalGrade_calculatesStatusAndSaves() {
        FinalGradeRequest request = new FinalGradeRequest();
        request.setEnterpriseTotalScore(new BigDecimal("7.0"));
        request.setFinalGrade(new BigDecimal("8.56")); // Should round to 8.6
        request.setStudentId(UUID.randomUUID());
        request.setTmId(UUID.randomUUID());
        request.setSemesterId(UUID.randomUUID());

        when(repository.save(any(FinalGrade.class))).thenAnswer(i -> i.getArgument(0));

        FinalGrade result = service.create(request);

        assertNotNull(result);
        assertEquals(new BigDecimal("8.6"), result.getGradeValue());
        assertEquals("PASS", result.getOverallStatus());
        assertNotNull(result.getStudent());
        assertNotNull(result.getTm());
        assertNotNull(result.getSemester());
    }

    @Test
    void create_withEnterpriseScoreOnly_calculatesStatusAndSaves() {
        FinalGradeRequest request = new FinalGradeRequest();
        request.setEnterpriseTotalScore(new BigDecimal("4.45")); // Should round to 4.5
        request.setFinalGrade(null);

        when(repository.save(any(FinalGrade.class))).thenAnswer(i -> i.getArgument(0));

        FinalGrade result = service.create(request);

        assertNotNull(result);
        assertEquals(new BigDecimal("4.5"), result.getGradeValue());
        assertEquals("FAIL", result.getOverallStatus());
    }

    @Test
    void create_withNoScores_calculatesZeroAndFails() {
        FinalGradeRequest request = new FinalGradeRequest();
        request.setEnterpriseTotalScore(null);
        request.setFinalGrade(null);

        when(repository.save(any(FinalGrade.class))).thenAnswer(i -> i.getArgument(0));

        FinalGrade result = service.create(request);

        assertNotNull(result);
        assertEquals(new BigDecimal("0.0"), result.getGradeValue()); // Rounded to 1 decimal place
        assertEquals("FAIL", result.getOverallStatus());
    }

    @Test
    void deleteById_success() {
        service.deleteById(gradeId);
        verify(repository).deleteById(gradeId);
    }
}
