package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.ueims.dto.response.RequestLogResponseDTO;
import com.ueims.model.entity.RequestLog;
import com.ueims.repository.RequestLogRepository;
import com.ueims.service.websocket.RequestLogBroadcaster;

@ExtendWith(MockitoExtension.class)
class RequestLogServiceImplTest {

    @Mock
    private RequestLogRepository repository;

    private RequestLogBroadcaster broadcaster;
    private boolean broadcastCalled = false;

    @InjectMocks
    private RequestLogServiceImpl service;

    private RequestLog logEntry;

    @BeforeEach
    void setUp() {
        logEntry = new RequestLog();
        logEntry.setId(UUID.randomUUID());
        logEntry.setUserId(UUID.randomUUID());
        logEntry.setUserEmail("admin@fpt.edu.vn");
        logEntry.setMethod(RequestLog.HttpMethod.GET);
        logEntry.setEndpoint("/api/v1/users");
        logEntry.setStatusCode(200);
        logEntry.setIpAddress("127.0.0.1");
        logEntry.setResponseTimeMs(45L);
        logEntry.setTimestamp(LocalDateTime.of(2026, 1, 1, 10, 0));
        logEntry.setUserAgent("Mozilla/5.0");

        broadcastCalled = false;
        broadcaster = new RequestLogBroadcaster(null) {
            @Override
            public void broadcast(RequestLogResponseDTO dto) {
                broadcastCalled = true;
            }
        };
        service = new RequestLogServiceImpl(repository, broadcaster);
    }

    @Test
    void clearAll_success() {
        when(repository.count()).thenReturn(150L);

        long count = service.clearAll();

        assertEquals(150L, count);
        verify(repository).deleteAllInBatch();
    }

    @Test
    void logRequest_success() {
        when(repository.save(any(RequestLog.class))).thenReturn(logEntry);

        service.logRequest(logEntry);

        verify(repository).save(logEntry);
        assertTrue(broadcastCalled);
    }

    @Test
    void logRequest_exceptionCaught() {
        when(repository.save(any(RequestLog.class))).thenThrow(new RuntimeException("DB down"));

        assertDoesNotThrow(() -> service.logRequest(logEntry));

        assertFalse(broadcastCalled);
    }

    @Test
    @SuppressWarnings("unchecked")
    void searchLogs_success() {
        Page<RequestLog> page = new PageImpl<>(List.of(logEntry));
        when(repository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Page<RequestLogResponseDTO> result = service.searchLogs(
                logEntry.getUserId(),
                RequestLog.HttpMethod.GET,
                "/api",
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now(),
                PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        assertEquals("admin@fpt.edu.vn", result.getContent().get(0).getUserEmail());
    }

    @Test
    void getLogsByUser_success() {
        Page<RequestLog> page = new PageImpl<>(List.of(logEntry));
        when(repository.findByUserId(any(UUID.class), any(Pageable.class))).thenReturn(page);

        Page<RequestLogResponseDTO> result = service.getLogsByUser(logEntry.getUserId(), PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        assertEquals(logEntry.getId(), result.getContent().get(0).getId());
    }

    @Test
    void getRecentLogs_success() {
        Page<RequestLog> page = new PageImpl<>(List.of(logEntry));
        when(repository.findByTimestampAfter(any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(page);

        Page<RequestLogResponseDTO> result = service.getRecentLogs(PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        assertEquals("/api/v1/users", result.getContent().get(0).getEndpoint());
    }

    @Test
    @SuppressWarnings("unchecked")
    void exportCsv_success() {
        // Create an entry that requires escaping
        RequestLog trickyLog = new RequestLog();
        trickyLog.setId(UUID.randomUUID());
        trickyLog.setUserEmail("bad,email@fpt.edu.vn"); // Contains comma
        trickyLog.setEndpoint("/api/\"test\""); // Contains quote
        trickyLog.setTimestamp(LocalDateTime.of(2026, 1, 1, 12, 0));

        Page<RequestLog> page = new PageImpl<>(List.of(logEntry, trickyLog));
        when(repository.findAll(any(Specification.class), eq(Pageable.unpaged())))
                .thenReturn(page);

        byte[] csvBytes = service.exportCsv(null, null, null, null, null);
        String csvContent = new String(csvBytes);

        assertTrue(csvContent.contains(
                "ID,Timestamp,User Email,HTTP Method,Endpoint,Status Code,IP Address,Response Time (ms),User Agent"));
        assertTrue(csvContent.contains("admin@fpt.edu.vn"));
        assertTrue(csvContent.contains("\"bad,email@fpt.edu.vn\"")); // Should be escaped
        assertTrue(csvContent.contains("\"/api/\"\"test\"\"\"")); // Should be escaped
    }

    @Test
    @SuppressWarnings("unchecked")
    void exportCsv_exceptionReturnsEmpty() {
        when(repository.findAll(any(Specification.class), eq(Pageable.unpaged())))
                .thenThrow(new RuntimeException("IO Error"));

        assertThrows(RuntimeException.class, () -> service.exportCsv(null, null, null, null, null));
    }
}
