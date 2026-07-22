package com.ueims.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.ueims.model.entity.FinalGrade;
import com.ueims.repository.FinalGradeRepository;
import com.ueims.repository.PlacementApplicationRepository;
import com.ueims.service.AtRiskStudentService;
import com.ueims.service.ExcelExportService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExcelExportServiceImpl implements ExcelExportService {
    AtRiskStudentService atRiskStudentService;
    FinalGradeRepository finalGradeRepository;
    PlacementApplicationRepository placementApplicationRepository;

    @Override
    public ResponseEntity<byte[]> exportAtRiskStudents(UUID semesterId) {
        List<AtRiskStudentResult> students = atRiskStudentService.getAtRiskStudentsBySemester(semesterId);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("At-Risk Students");

            // Create Header
            Row headerRow = sheet.createRow(0);
            String[] columns = {
                "Student Code",
                "Full Name",
                "Company Name",
                "Risk Category",
                "Priority Score",
                "Missed Reports",
                "Rejected Reports",
                "Risk Reason",
                "Days at Risk"
            };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            // Fill Data
            int rowNum = 1;
            for (AtRiskStudentResult student : students) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(student.getStudentCode() != null ? student.getStudentCode() : "");
                row.createCell(1).setCellValue(student.getStudentName() != null ? student.getStudentName() : "");
                row.createCell(2).setCellValue(student.getCompanyName() != null ? student.getCompanyName() : "");
                row.createCell(3).setCellValue(student.getRiskCategory() != null ? student.getRiskCategory() : "");
                row.createCell(4).setCellValue(student.getPriorityScore() != null ? student.getPriorityScore() : 0);
                row.createCell(5).setCellValue(student.getMissedReports() != null ? student.getMissedReports() : 0);
                row.createCell(6).setCellValue(student.getRejectedReports() != null ? student.getRejectedReports() : 0);
                row.createCell(7).setCellValue(student.getRiskReason() != null ? student.getRiskReason() : "");
                row.createCell(8).setCellValue(student.getDaysAtRisk() != null ? student.getDaysAtRisk() : 0);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=at_risk_students.xlsx")
                    .body(outputStream.toByteArray());

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<byte[]> exportOjtPlacements(UUID semesterId, String major, String status) {
        List<Object[]> applications = placementApplicationRepository.findOjtPlacementView();

        List<Object[]> filtered = applications.stream()
                .filter(row -> {
                    boolean matchMajor = major == null || major.isEmpty() || major.equals(row[3]);
                    boolean matchStatus = status == null || status.isEmpty() || status.equals(row[6]);
                    boolean matchSemester =
                            semesterId == null || semesterId.toString().equals(row[4].toString());
                    return matchMajor && matchStatus && matchSemester;
                })
                .toList();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("OJT Placements");

            // Create Header
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Student Code", "Student Name", "Enterprise Name", "Status", "Major"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            // Fill Data
            int rowNum = 1;
            for (Object[] app : filtered) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(app[2] != null ? app[2].toString() : ""); // student_code
                row.createCell(1).setCellValue(app[1] != null ? app[1].toString() : ""); // student_name
                row.createCell(2).setCellValue(app[9] != null ? app[9].toString() : ""); // enterprise_name
                row.createCell(3).setCellValue(app[6] != null ? app[6].toString() : ""); // workflow_status
                row.createCell(4).setCellValue(app[3] != null ? app[3].toString() : ""); // major
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ojt_placements.xlsx")
                    .body(outputStream.toByteArray());

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportFinalGrades() {
        List<FinalGrade> grades = finalGradeRepository.findAllWithStudentGraph();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Final Grades");

            // Create Header
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Student Name", "Grade Value", "Status"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            // Fill Data
            int rowNum = 1;
            for (FinalGrade grade : grades) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(grade.getStudent().getFullName());
                row.createCell(1).setCellValue(grade.getGradeValue().doubleValue());
                row.createCell(2).setCellValue(grade.getOverallStatus());
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=final_grades.xlsx")
                    .body(outputStream.toByteArray());

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportFinalGradesPdf() {
        List<FinalGrade> grades = finalGradeRepository.findAllWithStudentGraph();

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);

            document.open();
            document.add(new Paragraph("Final Grade Report"));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(3);
            table.addCell("Student Name");
            table.addCell("Grade Value");
            table.addCell("Status");

            for (FinalGrade grade : grades) {
                table.addCell(grade.getStudent().getFullName());
                table.addCell(String.valueOf(grade.getGradeValue().doubleValue()));
                table.addCell(grade.getOverallStatus());
            }

            document.add(table);
            document.close();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=final_grades.pdf")
                    .body(outputStream.toByteArray());

        } catch (IOException | DocumentException e) {
            org.slf4j.LoggerFactory.getLogger(ExcelExportServiceImpl.class)
                    .error("exportFinalGradesPdf failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
