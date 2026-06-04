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

    public static List<EligibleStudent> parseEligibleStudents(InputStream is) {
        try (Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            List<EligibleStudent> students = new ArrayList<>();

            boolean isHeader = true;
            for (Row row : sheet) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }
                students.add(parseRow(row));
            }
            return students;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
    }

    private static EligibleStudent parseRow(Row row) {
        EligibleStudent student = new EligibleStudent();
        student.setStudentCode(getRequiredStringCellValue(row, 0));
        student.setFullName(getRequiredStringCellValue(row, 1));
        student.setEmail(getOptionalStringCellValue(row, 2));
        student.setMajor(getRequiredStringCellValue(row, 3));
        student.setGpa(getRequiredGpaValue(row, 4));
        student.setCurrentSemester(getRequiredIntCellValue(row, 5));
        return student;
    }

    private static String getRequiredStringCellValue(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
        return cell.getStringCellValue();
    }

    private static String getOptionalStringCellValue(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        return cell != null ? cell.getStringCellValue() : null;
    }

    private static BigDecimal getRequiredGpaValue(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
        BigDecimal gpa = new BigDecimal(String.valueOf(cell.getNumericCellValue()));
        if (gpa.compareTo(new BigDecimal("2.0")) < 0) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
        return gpa;
    }

    private static int getRequiredIntCellValue(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
        return (int) cell.getNumericCellValue();
    }
}
