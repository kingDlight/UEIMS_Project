package com.ueims.util;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EligibleStudent;

public class ExcelImportUtil {

    private ExcelImportUtil() {
        throw new IllegalStateException("Utility class");
    }

    private static class ColumnMapping {
        int studentCode = -1;
        int fullName = -1;
        int email = -1;
        int major = -1;
        int gpa = -1;
        int semester = -1;

        boolean isValid() {
            return studentCode != -1 && fullName != -1 && major != -1 && gpa != -1 && semester != -1;
        }
    }

    public static List<EligibleStudent> parseEligibleStudents(InputStream is) {
        try (Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            List<EligibleStudent> students = new ArrayList<>();
            ColumnMapping mapping = null;

            boolean isHeader = true;
            for (Row row : sheet) {
                if (isHeader) {
                    mapping = parseHeader(row);
                    if (!mapping.isValid()) {
                        throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
                    }
                    isHeader = false;
                    continue;
                }

                // Skip completely empty rows
                if (isRowEmpty(row)) continue;

                students.add(parseRow(row, mapping));
            }
            return students;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
    }

    private static boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != org.apache.poi.ss.usermodel.CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    private static ColumnMapping parseHeader(Row row) {
        ColumnMapping mapping = new ColumnMapping();
        for (Cell cell : row) {
            String header = formatter.formatCellValue(cell).trim().toLowerCase();
            if (header.contains("student code") || header.contains("mã sinh viên") || header.contains("mã sv")) {
                mapping.studentCode = cell.getColumnIndex();
            } else if (header.contains("full name") || header.contains("họ tên") || header.contains("họ và tên")) {
                mapping.fullName = cell.getColumnIndex();
            } else if (header.contains("email")) {
                mapping.email = cell.getColumnIndex();
            } else if (header.contains("major") || header.contains("chuyên ngành") || header.contains("ngành")) {
                mapping.major = cell.getColumnIndex();
            } else if (header.contains("gpa")) {
                mapping.gpa = cell.getColumnIndex();
            } else if (header.contains("semester") || header.contains("học kỳ") || header.contains("kỳ học")) {
                mapping.semester = cell.getColumnIndex();
            }
        }
        return mapping;
    }

    private static EligibleStudent parseRow(Row row, ColumnMapping mapping) {
        EligibleStudent student = new EligibleStudent();
        student.setStudentCode(getRequiredStringCellValue(row, mapping.studentCode));
        student.setFullName(getRequiredStringCellValue(row, mapping.fullName));
        if (mapping.email != -1) {
            student.setEmail(getOptionalStringCellValue(row, mapping.email));
        }
        student.setMajor(getRequiredStringCellValue(row, mapping.major));
        student.setGpa(getRequiredGpaValue(row, mapping.gpa));
        student.setCurrentSemester(getRequiredIntCellValue(row, mapping.semester));
        return student;
    }

    private static final org.apache.poi.ss.usermodel.DataFormatter formatter =
            new org.apache.poi.ss.usermodel.DataFormatter();

    private static String getRequiredStringCellValue(Row row, int cellIndex) {
        if (cellIndex < 0) throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        Cell cell = row.getCell(cellIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
        String val = formatter.formatCellValue(cell).trim();
        if (val.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
        return val;
    }

    private static String getOptionalStringCellValue(Row row, int cellIndex) {
        if (cellIndex < 0) return null;
        Cell cell = row.getCell(cellIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) {
            return null;
        }
        String val = formatter.formatCellValue(cell).trim();
        return val.isEmpty() ? null : val;
    }

    private static BigDecimal getRequiredGpaValue(Row row, int cellIndex) {
        if (cellIndex < 0) throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        Cell cell = row.getCell(cellIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
        try {
            String strVal = formatter.formatCellValue(cell).trim();
            BigDecimal gpa = new BigDecimal(strVal);
            if (gpa.compareTo(BigDecimal.ZERO) < 0 || gpa.compareTo(new BigDecimal("10.0")) > 0) {
                throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
            }
            return gpa;
        } catch (NumberFormatException e) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
    }

    private static int getRequiredIntCellValue(Row row, int cellIndex) {
        if (cellIndex < 0) throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        Cell cell = row.getCell(cellIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
        try {
            String strVal = formatter.formatCellValue(cell).trim();
            return Integer.parseInt(strVal);
        } catch (NumberFormatException e) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
    }
}
