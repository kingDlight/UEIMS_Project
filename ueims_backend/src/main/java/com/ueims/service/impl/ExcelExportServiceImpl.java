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
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.ueims.model.entity.AtRiskStudent;
import com.ueims.model.entity.FinalGrade;
import com.ueims.repository.AtRiskStudentRepository;
import com.ueims.repository.FinalGradeRepository;
import com.ueims.service.ExcelExportService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExcelExportServiceImpl implements ExcelExportService {
    AtRiskStudentRepository atRiskStudentRepository;
    FinalGradeRepository finalGradeRepository;

    @Override
    public ResponseEntity<byte[]> exportAtRiskStudents(UUID semesterId) {
        List<AtRiskStudent> students = atRiskStudentRepository
                .findBySemesterId(semesterId, PageRequest.of(0, 10000))
                .getContent();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("At-Risk Students");

            // Create Header
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Student Code", "Full Name", "Company Name", "Missed Reports", "Rejected Reports"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            // Fill Data
            int rowNum = 1;
            for (AtRiskStudent student : students) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(student.getStudentCode());
                row.createCell(1).setCellValue(student.getStudentName());
                row.createCell(2).setCellValue(student.getCompanyName());
                row.createCell(3).setCellValue(student.getMissedReports());
                row.createCell(4).setCellValue(student.getRejectedReports());
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
    public ResponseEntity<byte[]> exportFinalGrades() {
        List<FinalGrade> grades =
                finalGradeRepository.findAll(PageRequest.of(0, 10000)).getContent();

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
    public ResponseEntity<byte[]> exportFinalGradesPdf() {
        List<FinalGrade> grades =
                finalGradeRepository.findAll(PageRequest.of(0, 10000)).getContent();

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
            return ResponseEntity.internalServerError().build();
        }
    }
}
