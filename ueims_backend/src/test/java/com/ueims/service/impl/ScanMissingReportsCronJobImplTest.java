package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.dto.response.MissingReportDto;
import com.ueims.exception.AppException;
import com.ueims.service.ScanMissingReportsService;

@ExtendWith(MockitoExtension.class)
class ScanMissingReportsCronJobImplTest {

    @Mock
    private ScanMissingReportsService scanService;

    @InjectMocks
    private ScanMissingReportsCronJobImpl service;

    @Test
    void executeWithEmptyListSuccess() {
        when(scanService.scanMissingReports()).thenReturn(Collections.emptyList());

        service.execute();

        verify(scanService).scanMissingReports();
    }

    @Test
    void executeWithMissingReportsSuccess() {
        MissingReportDto report = MissingReportDto.builder()
                .assignmentId(UUID.randomUUID())
                .studentId(UUID.randomUUID())
                .studentName("Student A")
                .semesterId(UUID.randomUUID())
                .weekNumber(1)
                .enterpriseName("Enterprise B")
                .build();
        when(scanService.scanMissingReports()).thenReturn(List.of(report));

        service.execute();

        verify(scanService).scanMissingReports();
    }

    @Test
    void executeThrowsAppException() {
        when(scanService.scanMissingReports()).thenThrow(new RuntimeException("Database error"));

        assertThrows(AppException.class, () -> service.execute());

        verify(scanService).scanMissingReports();
    }

    @Test
    void getJobNameSuccess() {
        assertEquals("ScanMissingReportsCronJob", service.getJobName());
    }
}
