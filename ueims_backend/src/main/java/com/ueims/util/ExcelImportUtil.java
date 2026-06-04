package com.ueims.util;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
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

    public static List<EligibleStudent> parseEligibleStudents(InputStream is) {
        try {
            Workbook workbook = new XSSFWorkbook(is);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            List<EligibleStudent> students = new ArrayList<>();

            int rowNumber = 0;
            while (rows.hasNext()) {
                Row currentRow = rows.next();

                // Skip header row
                if (rowNumber == 0) {
                    rowNumber++;
                    continue;
                }

                EligibleStudent student = new EligibleStudent();

                // Assuming columns: 0=Student Code, 1=Full Name, 2=Email, 3=Major, 4=GPA, 5=Current Semester
                Cell codeCell = currentRow.getCell(0, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                if (codeCell != null) {
                    student.setStudentCode(codeCell.getStringCellValue());
                } else {
                    throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
                }

                Cell nameCell = currentRow.getCell(1, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                if (nameCell != null) {
                    student.setFullName(nameCell.getStringCellValue());
                } else {
                    throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
                }

                Cell emailCell = currentRow.getCell(2, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                if (emailCell != null) {
                    student.setEmail(emailCell.getStringCellValue());
                }

                Cell majorCell = currentRow.getCell(3, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                if (majorCell != null) {
                    student.setMajor(majorCell.getStringCellValue());
                } else {
                    throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
                }

                Cell gpaCell = currentRow.getCell(4, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                if (gpaCell != null) {
                    BigDecimal gpa = new BigDecimal(String.valueOf(gpaCell.getNumericCellValue()));
                    if (gpa.compareTo(new BigDecimal("2.0")) < 0) {
                        throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
                    }
                    student.setGpa(gpa);
                } else {
                    throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
                }

                Cell semesterCell = currentRow.getCell(5, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                if (semesterCell != null) {
                    int sem = (int) semesterCell.getNumericCellValue();
                    if (sem != 5 && sem != 6) {
                        throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
                    }
                    student.setCurrentSemester(sem);
                } else {
                    throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
                }

                students.add(student);
                rowNumber++;
            }
            workbook.close();
            return students;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
    }
}
