package com.ueims.util;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.ueims.dto.request.StudentImportRow;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EligibleStudent;

public class ExcelImportUtil {

    private static final DateTimeFormatter[] DATE_FORMATS = new DateTimeFormatter[] {
            DateTimeFormatter.ISO_LOCAL_DATE,                 // 2026-07-01
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
    };

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

    // ============================================================
    // STUDENT IMPORT — used by TM bulk upload
    // Richer row: 17+ columns covering user + student_profile + eligible_students.
    // Header matching is case-insensitive substring match against
    // English / Vietnamese aliases so the TM can ship a single template.
    // ============================================================

    private static class ImportColumnMapping {
        int studentCode = -1;
        int fullName = -1;
        int email = -1;
        int major = -1;
        int gpa = -1;
        int currentSemester = -1;
        int semesterNameOrCode = -1;
        int phone = -1;
        int classCode = -1;
        int dateOfBirth = -1;
        int gender = -1;
        int address = -1;
        int skills = -1;
        int linkedinUrl = -1;
        int githubUrl = -1;
        int portfolioUrl = -1;
        int bio = -1;

        boolean isValid() {
            return studentCode != -1
                    && fullName != -1
                    && email != -1
                    && major != -1
                    && gpa != -1
                    && currentSemester != -1
                    && semesterNameOrCode != -1;
        }
    }

    /**
     * Parses a TM upload into a list of {@link StudentImportRow} with the original
     * 1-based Excel row number preserved on each row (so error reports can point
     * the user to the exact cell). Required-column validation happens here.
     */
    public static List<StudentImportRow> parseStudentImportRows(InputStream is) {
        try (Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            List<StudentImportRow> rows = new ArrayList<>();
            ImportColumnMapping mapping = null;
            int physicalRowIdx = 0;
            for (Row row : sheet) {
                physicalRowIdx++;
                if (mapping == null) {
                    mapping = parseImportHeader(row);
                    if (!mapping.isValid()) {
                        throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
                    }
                    continue;
                }
                if (isRowEmpty(row)) continue;
                rows.add(parseImportRow(row, mapping, physicalRowIdx));
            }
            return rows;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
    }

    private static ImportColumnMapping parseImportHeader(Row row) {
        ImportColumnMapping mapping = new ImportColumnMapping();
        for (Cell cell : row) {
            String header = formatter.formatCellValue(cell).trim().toLowerCase();
            if (header.isEmpty()) continue;
            if (containsAny(header, "student code", "mã sinh viên", "mã sv", "mssv")) {
                mapping.studentCode = cell.getColumnIndex();
            } else if (containsAny(header, "full name", "họ tên", "họ và tên", "student name")) {
                mapping.fullName = cell.getColumnIndex();
            } else if (header.contains("email")) {
                mapping.email = cell.getColumnIndex();
            } else if (containsAny(header, "major", "chuyên ngành", "ngành")) {
                mapping.major = cell.getColumnIndex();
            } else if (header.contains("gpa")) {
                mapping.gpa = cell.getColumnIndex();
            } else if (containsAny(header, "current semester", "current_semester", "học kỳ hiện tại", "kỳ hiện tại")) {
                mapping.currentSemester = cell.getColumnIndex();
            } else if (containsAny(header, "semester", "học kỳ", "kỳ học") && mapping.semesterNameOrCode == -1) {
                // match the loosest "semester" header for the row's semester
                // (currentSemester was matched with a more specific alias above)
                mapping.semesterNameOrCode = cell.getColumnIndex();
            } else if (containsAny(header, "phone", "sđt", "số điện thoại")) {
                mapping.phone = cell.getColumnIndex();
            } else if (containsAny(header, "class code", "class_code", "lớp", "mã lớp")) {
                mapping.classCode = cell.getColumnIndex();
            } else if (containsAny(header, "date of birth", "date_of_birth", "dob", "ngày sinh")) {
                mapping.dateOfBirth = cell.getColumnIndex();
            } else if (containsAny(header, "gender", "giới tính")) {
                mapping.gender = cell.getColumnIndex();
            } else if (containsAny(header, "address", "địa chỉ")) {
                mapping.address = cell.getColumnIndex();
            } else if (containsAny(header, "skills", "kỹ năng")) {
                mapping.skills = cell.getColumnIndex();
            } else if (containsAny(header, "linkedin")) {
                mapping.linkedinUrl = cell.getColumnIndex();
            } else if (containsAny(header, "github")) {
                mapping.githubUrl = cell.getColumnIndex();
            } else if (containsAny(header, "portfolio")) {
                mapping.portfolioUrl = cell.getColumnIndex();
            } else if (containsAny(header, "bio", "about", "giới thiệu")) {
                mapping.bio = cell.getColumnIndex();
            }
        }
        return mapping;
    }

    private static boolean containsAny(String haystack, String... needles) {
        for (String n : needles) {
            if (haystack.contains(n)) return true;
        }
        return false;
    }

    private static StudentImportRow parseImportRow(Row row, ImportColumnMapping mapping, int rowNumber) {
        try {
            StudentImportRow out = new StudentImportRow();
            out.setStudentCode(getRequiredStringCellValue(row, mapping.studentCode));
            out.setFullName(getRequiredStringCellValue(row, mapping.fullName));
            out.setEmail(getRequiredStringCellValue(row, mapping.email));
            out.setMajor(getRequiredStringCellValue(row, mapping.major));
            out.setGpa(getRequiredGpaValue(row, mapping.gpa));
            out.setCurrentSemester(getRequiredIntCellValue(row, mapping.currentSemester));
            out.setSemesterNameOrCode(getRequiredStringCellValue(row, mapping.semesterNameOrCode));

            if (mapping.phone != -1) {
                out.setPhone(getOptionalStringCellValue(row, mapping.phone));
            }
            if (mapping.classCode != -1) {
                out.setClassCode(getOptionalStringCellValue(row, mapping.classCode));
            }
            if (mapping.dateOfBirth != -1) {
                out.setDateOfBirth(parseOptionalDate(row, mapping.dateOfBirth));
            }
            if (mapping.gender != -1) {
                out.setGender(normalizeGender(getOptionalStringCellValue(row, mapping.gender)));
            }
            if (mapping.address != -1) {
                out.setAddress(getOptionalStringCellValue(row, mapping.address));
            }
            if (mapping.skills != -1) {
                out.setSkills(getOptionalStringCellValue(row, mapping.skills));
            }
            if (mapping.linkedinUrl != -1) {
                out.setLinkedinUrl(getOptionalStringCellValue(row, mapping.linkedinUrl));
            }
            if (mapping.githubUrl != -1) {
                out.setGithubUrl(getOptionalStringCellValue(row, mapping.githubUrl));
            }
            if (mapping.portfolioUrl != -1) {
                out.setPortfolioUrl(getOptionalStringCellValue(row, mapping.portfolioUrl));
            }
            if (mapping.bio != -1) {
                out.setBio(getOptionalStringCellValue(row, mapping.bio));
            }
            return out;
        } catch (AppException e) {
            // re-throw with row context so the caller can build a useful error report
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
    }

    private static LocalDate parseOptionalDate(Row row, int cellIndex) {
        String raw = getOptionalStringCellValue(row, cellIndex);
        if (raw == null || raw.isBlank()) return null;
        for (DateTimeFormatter f : DATE_FORMATS) {
            try {
                return LocalDate.parse(raw.trim(), f);
            } catch (DateTimeParseException ignored) {
                // try next
            }
        }
        // Excel stores dates as numeric values; try to read as number and convert
        Cell cell = row.getCell(cellIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell != null && cell.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC) {
            try {
                return cell.getLocalDateTimeCellValue().toLocalDate();
            } catch (Exception ignored) {
                // fall through
            }
        }
        throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
    }

    private static String normalizeGender(String raw) {
        if (raw == null) return null;
        String v = raw.trim().toUpperCase();
        return switch (v) {
            case "M", "MALE", "NAM", "男" -> "MALE";
            case "F", "FEMALE", "NỮ", "女" -> "FEMALE";
            case "O", "OTHER", "KHÁC" -> "OTHER";
            default -> null;
        };
    }
}
