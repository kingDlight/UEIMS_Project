package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.AuditLog;
import com.ueims.model.entity.User;
import com.ueims.repository.AuditLogRepository;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceImplTest {

    @Mock
    private AuditLogRepository repository;

    @InjectMocks
    private AuditLogServiceImpl service;

    private AuditLog auditLog;
    private UUID logId;

    @BeforeEach
    void setUp() {
        logId = UUID.randomUUID();
        auditLog = new AuditLog();
        auditLog.setLogId(logId);
        auditLog.setAction("CREATE");
        auditLog.setTargetEntity("User");
        auditLog.setIpAddress("127.0.0.1");
        auditLog.setUserAgent("Mozilla/5.0");
        auditLog.setTimestamp(LocalDateTime.now());

        User user = new User();
        user.setEmail("admin@test.com");
        auditLog.setUser(user);
    }

    @Test
    void findAll_returnsList() {
        when(repository.findAll()).thenReturn(List.of(auditLog));
        List<AuditLog> result = service.findAll();
        assertEquals(1, result.size());
    }

    @Test
    void findById_exists_returnsAuditLog() {
        when(repository.findById(logId)).thenReturn(Optional.of(auditLog));
        AuditLog result = service.findById(logId);
        assertNotNull(result);
        assertEquals(logId, result.getLogId());
    }

    @Test
    void findById_notExists_returnsNull() {
        when(repository.findById(any())).thenReturn(Optional.empty());
        AuditLog result = service.findById(UUID.randomUUID());
        assertNull(result);
    }

    @Test
    void exportExcel_success() {
        AuditLog nullValuesLog = new AuditLog();
        nullValuesLog.setLogId(UUID.randomUUID());

        when(repository.findByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(auditLog, nullValuesLog));

        byte[] result = service.exportExcel(LocalDate.now().minusDays(1), LocalDate.now());

        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void exportExcel_withNullDates_success() {
        when(repository.findByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(auditLog));

        byte[] result = service.exportExcel(null, null);

        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void exportExcel_exceedLimit_throwsException() {
        // Create a mock list that returns a size greater than 50000
        List<AuditLog> largeList = new ArrayList<>() {
            @Override
            public int size() {
                return 50001;
            }
        };

        when(repository.findByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(largeList);

        LocalDate date = LocalDate.now();
        AppException exception = assertThrows(AppException.class, () -> service.exportExcel(date, date));

        assertEquals(ErrorCode.EXPORT_LOG_EXCEED_LIMIT, exception.getErrorCode());
    }
}
