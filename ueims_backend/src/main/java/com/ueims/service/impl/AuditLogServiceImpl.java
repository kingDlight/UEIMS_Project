package com.ueims.service.impl;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.AuditLog;
import com.ueims.repository.AuditLogRepository;
import com.ueims.service.AuditLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {
    private final AuditLogRepository repository;

    @Override
    public List<AuditLog> findAll() {
        return repository.findAll();
    }

    @Override
    public AuditLog findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public byte[] exportExcel(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime =
                (startDate != null) ? startDate.atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime endDateTime =
                (endDate != null) ? endDate.atTime(LocalTime.MAX) : LocalDateTime.of(2099, 12, 31, 23, 59);

        List<AuditLog> logs = repository.findByDateRange(startDateTime, endDateTime);

        // UC-13 Other Information: The export threshold for System Logs is set at 50,000 records
        if (logs.size() > 50000) {
            throw new AppException(ErrorCode.EXPORT_LOG_EXCEED_LIMIT);
        }

        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Audit Logs");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Headers
            Row headerRow = sheet.createRow(0);
            String[] columns = {
                "Log ID", "Timestamp", "User Email", "Action", "Target Entity", "IP Address", "User Agent"
            };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowIdx = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (AuditLog logRecord : logs) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(logRecord.getLogId().toString());
                row.createCell(1)
                        .setCellValue(
                                logRecord.getTimestamp() != null
                                        ? logRecord.getTimestamp().format(formatter)
                                        : "");
                row.createCell(2)
                        .setCellValue(
                                logRecord.getUser() != null
                                        ? logRecord.getUser().getEmail()
                                        : "anonymous");
                row.createCell(3).setCellValue(logRecord.getAction());
                row.createCell(4).setCellValue(logRecord.getTargetEntity());
                row.createCell(5).setCellValue(logRecord.getIpAddress());
                row.createCell(6).setCellValue(logRecord.getUserAgent());
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to export Excel", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
}
