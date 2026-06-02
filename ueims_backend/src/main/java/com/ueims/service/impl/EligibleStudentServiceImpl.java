package com.ueims.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.response.EligibleStudentResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.Semester;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.service.EligibleStudentService;
import com.ueims.util.ExcelImportUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EligibleStudentServiceImpl implements EligibleStudentService {
    private final EligibleStudentRepository repository;
    private final SemesterRepository semesterRepository;

    @Override
    public List<EligibleStudent> findAll() {
        return repository.findAll();
    }

    @Override
    public EligibleStudent findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public EligibleStudent save(EligibleStudent entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public List<EligibleStudentResponse> importFromExcel(MultipartFile file, UUID semesterId) {
        Semester semester = semesterRepository
                .findById(semesterId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        List<EligibleStudent> parsed;
        try {
            parsed = ExcelImportUtil.parseEligibleStudents(file.getInputStream());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }

        List<EligibleStudent> toInsert = new ArrayList<>();
        int skipped = 0;

        for (EligibleStudent student : parsed) {
            if (repository.existsByStudentCodeAndSemester_SemesterId(student.getStudentCode(), semesterId)) {
                skipped++;
            } else {
                student.setSemester(semester);
                toInsert.add(student);
            }
        }

        if (skipped > 0) {
            log.warn("Skipped {} duplicate student(s) already in semester {}", skipped, semesterId);
        }

        List<EligibleStudent> savedStudents = repository.saveAll(toInsert);

        return savedStudents.stream()
                .map(s -> EligibleStudentResponse.builder()
                        .studentCode(s.getStudentCode())
                        .fullName(s.getFullName())
                        .email(s.getEmail())
                        .major(s.getMajor())
                        .gpa(s.getGpa())
                        .currentSemester(s.getCurrentSemester())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public int finalizeOjtList(UUID semesterId) {
        List<EligibleStudent> students = repository.findBySemester_SemesterIdAndStatus(semesterId, "ACCEPTED");
        if (students.isEmpty()) {
            return 0;
        }

        LocalDateTime now = LocalDateTime.now();
        for (EligibleStudent student : students) {
            student.setStatus("OJT");
            student.setApprovedAt(now);
        }

        repository.saveAll(students);
        log.info("Finalized OJT list for semester {}, {} students moved to OJT status.", semesterId, students.size());
        return students.size();
    }

    @Override
    public byte[] exportOjtStudentsToExcel(UUID semesterId) {
        List<EligibleStudent> students = repository.findBySemester_SemesterIdAndStatus(semesterId, "OJT");

        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("OJT Students");

            // Header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"No.", "Student Code", "Full Name", "Email", "Major", "GPA", "Semester", "Status"};
            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }

            // Data rows
            int rowIdx = 1;
            for (EligibleStudent student : students) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(rowIdx - 1);
                row.createCell(1).setCellValue(student.getStudentCode());
                row.createCell(2).setCellValue(student.getFullName());
                row.createCell(3).setCellValue(student.getEmail() != null ? student.getEmail() : "");
                row.createCell(4).setCellValue(student.getMajor());
                row.createCell(5)
                        .setCellValue(
                                student.getGpa() != null ? student.getGpa().doubleValue() : 0.0);
                row.createCell(6).setCellValue(student.getCurrentSemester() != null ? student.getCurrentSemester() : 0);
                row.createCell(7).setCellValue(student.getStatus());
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Failed to export OJT students to Excel", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
}
