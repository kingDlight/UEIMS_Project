package com.ueims.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.StudentEnterpriseFeedback;
import com.ueims.model.entity.User;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.StudentEnterpriseFeedbackRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.StudentEnterpriseFeedbackService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StudentEnterpriseFeedbackServiceImpl implements StudentEnterpriseFeedbackService {
    StudentEnterpriseFeedbackRepository repository;
    UserRepository userRepository;
    EligibleStudentRepository eligibleStudentRepository;

    private static final String DEBUG_LOG =
            "F:/Software Development Project/SWP_Project/UEIMS_Project/debug-feedback.log";

    private void debugLog(String msg) {
        try {
            Path p = Paths.get(DEBUG_LOG);
            Files.createDirectories(p.getParent());
            try (PrintWriter pw = new PrintWriter(new FileWriter(p.toFile(), true))) {
                pw.println(java.time.Instant.now() + " [FeedbackService] " + msg);
            }
        } catch (Exception ignored) {
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    public List<StudentEnterpriseFeedback> findAll() {
        debugLog("findAll");
        return repository.findAll();
    }

    @Override
    public StudentEnterpriseFeedback findById(UUID id) {
        debugLog("findById id=" + id);
        StudentEnterpriseFeedback feedback = repository.findById(id).orElse(null);
        if (feedback == null) {
            return null;
        }
        User currentUser = getCurrentUser();
        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("SYSTEM_ADMIN")
                        || role.getRole().getRoleName().equals("ADMIN")
                        || role.getRole().getRoleName().equals("TRAINING_MANAGER"));
        if (isStaff) {
            return feedback;
        }
        if (!feedback.getStudent().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return feedback;
    }

    @Override
    public List<StudentEnterpriseFeedback> findMyFeedbacks(UUID studentId) {
        debugLog("findMyFeedbacks studentId=" + studentId);
        try {
            List<StudentEnterpriseFeedback> result = repository.findByStudent_UserId(studentId);
            debugLog("findMyFeedbacks result size=" + result.size());
            return result;
        } catch (Exception e) {
            debugLog("findMyFeedbacks EXCEPTION: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public StudentEnterpriseFeedback save(StudentEnterpriseFeedback entity) {
        debugLog("save called");
        User currentUser = getCurrentUser();

        if (entity.getStudent() == null) {
            entity.setStudent(currentUser);
        }

        if (entity.getSemester() == null || entity.getSemester().getSemesterId() == null) {
            throw new AppException(ErrorCode.SEMESTER_ID_REQUIRED);
        }
        if (entity.getEnterprise() == null || entity.getEnterprise().getEnterpriseId() == null) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }

        // Check if student is eligible
        com.ueims.model.entity.EligibleStudent eligibleStudent = eligibleStudentRepository
                .findByUser_UserIdAndSemester_SemesterId(
                        currentUser.getUserId(), entity.getSemester().getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE));

        if (eligibleStudent.getCurrentSemester() == null || eligibleStudent.getCurrentSemester() < 7) {
            throw new AppException(ErrorCode.STUDENT_NOT_IN_SEMESTER_7);
        }

        // Enforce ownership
        if (!currentUser.getUserId().equals(entity.getStudent().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Constraint: Single Feedback Per Semester
        boolean exists = repository.existsByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
                currentUser.getUserId(),
                entity.getEnterprise().getEnterpriseId(),
                entity.getSemester().getSemesterId());
        if (exists) {
            throw new AppException(ErrorCode.FEEDBACK_DUPLICATE);
        }

        // Constraint: Feedback Rating Scale 1-5
        if (isInvalidScore(entity.getTrainingQualityScore())
                || isInvalidScore(entity.getSupervisorSupportScore())
                || isInvalidScore(entity.getWorkEnvironmentScore())
                || isInvalidScore(entity.getOverallScore())) {
            throw new AppException(ErrorCode.FEEDBACK_RATING_INVALID);
        }

        return repository.save(entity);
    }

    private boolean isInvalidScore(Integer score) {
        return score == null || score < 1 || score > 5;
    }

    @Override
    public void deleteById(UUID id) {
        StudentEnterpriseFeedback feedback = repository.findById(id).orElse(null);
        if (feedback == null) {
            return;
        }

        User currentUser = getCurrentUser();
        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(role -> role.getRole().getRoleName().equals("SYSTEM_ADMIN")
                        || role.getRole().getRoleName().equals("ADMIN")
                        || role.getRole().getRoleName().equals("TRAINING_MANAGER"));
        if (!isStaff) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        repository.deleteById(id);
    }

    @Override
    public byte[] exportToExcel(UUID semesterId) {
        List<StudentEnterpriseFeedback> feedbacks = repository.findBySemester_SemesterId(semesterId);

        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Enterprise Feedback Report");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            String[] headers = {
                    "No.", "Student Code", "Student Name", "Enterprise",
                    "Training Quality", "Supervisor Support", "Work Environment", "Overall Score",
                    "Positive Feedback", "Areas for Improvement", "Additional Comments", "Submitted At"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }
            sheet.setColumnWidth(8, 10000);
            sheet.setColumnWidth(9, 10000);
            sheet.setColumnWidth(10, 8000);

            int rowIdx = 1;
            for (StudentEnterpriseFeedback fb : feedbacks) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(rowIdx - 1);
                row.createCell(1).setCellValue(fb.getStudent() != null
                        ? (fb.getStudent().getStudentCode() != null ? fb.getStudent().getStudentCode() : "") : "");
                row.createCell(2).setCellValue(fb.getStudent() != null
                        ? fb.getStudent().getFullName() : "");
                row.createCell(3).setCellValue(fb.getEnterprise() != null
                        ? fb.getEnterprise().getName() : "");
                row.createCell(4).setCellValue(fb.getTrainingQualityScore() != null ? fb.getTrainingQualityScore() : 0);
                row.createCell(5).setCellValue(fb.getSupervisorSupportScore() != null ? fb.getSupervisorSupportScore() : 0);
                row.createCell(6).setCellValue(fb.getWorkEnvironmentScore() != null ? fb.getWorkEnvironmentScore() : 0);
                row.createCell(7).setCellValue(fb.getOverallScore() != null ? fb.getOverallScore() : 0);
                row.createCell(8).setCellValue(fb.getPositiveFeedback() != null ? fb.getPositiveFeedback() : "");
                row.createCell(9).setCellValue(fb.getImprovementFeedback() != null ? fb.getImprovementFeedback() : "");
                row.createCell(10).setCellValue(fb.getAdditionalComments() != null ? fb.getAdditionalComments() : "");
                row.createCell(11).setCellValue(fb.getSubmittedAt() != null ? fb.getSubmittedAt().toString() : "");
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export enterprise feedback report", e);
        }
    }
}
