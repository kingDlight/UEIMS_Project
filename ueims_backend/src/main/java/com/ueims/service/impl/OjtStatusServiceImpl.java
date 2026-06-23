package com.ueims.service.impl;

import java.io.FileWriter;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.response.OjtStatusResponse;
import com.ueims.model.entity.Application;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.OjtStatus;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.SemesterEnterprise;
import com.ueims.model.entity.User;
import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.InterviewRepository;
import com.ueims.repository.SemesterEnterpriseRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.WeeklyReportRepository;
import com.ueims.service.OjtStatusService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OjtStatusServiceImpl implements OjtStatusService {

    SemesterRepository semesterRepository;
    EligibleStudentRepository eligibleStudentRepository;
    EnterpriseAssignmentRepository enterpriseAssignmentRepository;
    ApplicationRepository applicationRepository;
    InterviewRepository interviewRepository;
    WeeklyReportRepository weeklyReportRepository;
    UserRepository userRepository;
    SemesterEnterpriseRepository semesterEnterpriseRepository;

    private static final String TRAINING_MANAGER_EMAIL = "training-office@ueims.edu.vn";
    private static final String TRAINING_MANAGER_NAME = "Phòng Đào Tạo";
    private static final String DEBUG_LOG =
            "F:/Software Development Project/SWP_Project/UEIMS_Project/debug-192559.log";

    private void debugLog(String msg) {
        try {
            Path p = Paths.get(DEBUG_LOG);
            Files.createDirectories(p.getParent());
            try (PrintWriter pw = new PrintWriter(new FileWriter(p.toFile(), true))) {
                pw.println(java.time.Instant.now() + " [OjtStatusService] " + msg);
            }
        } catch (Exception ignored) {
        }
    }

    @Override
    @Transactional(readOnly = true)
    public OjtStatusResponse getOjtStatusForCurrentUser(String email) {
        try {
            debugLog("START email=" + email);
            Optional<User> userOpt = userRepository.findByEmail(email);
            debugLog("userOpt.isPresent=" + userOpt.isPresent());
            if (userOpt.isEmpty()) {
                debugLog("user not found, returning default");
                return buildDefaultResponse();
            }
            User user = userOpt.get();
            debugLog("userId=" + user.getUserId());

            Optional<Semester> activeSemesterOpt =
                    semesterRepository.findByStatus("ACTIVE").stream().findFirst();
            if (activeSemesterOpt.isEmpty()) {
                return buildDefaultResponse();
            }
            Semester activeSemester = activeSemesterOpt.get();

            int currentSemesterNum = 0;
            UUID activeSemesterId = activeSemesterOpt.get().getSemesterId();
            debugLog("activeSemesterId=" + activeSemesterId);
            Optional<EligibleStudent> currentEligible =
                    eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                            user.getUserId(), activeSemesterId);
            debugLog("currentEligible.isPresent=" + currentEligible.isPresent());
            if (currentEligible.isPresent()) {
                currentSemesterNum = currentEligible.get().getCurrentSemester() != null
                        ? currentEligible.get().getCurrentSemester()
                        : 0;
                debugLog("currentSemesterNum=" + currentSemesterNum);
            }

            // Kỳ 1-4: chưa đến lúc OJT
            if (currentSemesterNum < 5) {
                debugLog("path: semester 1-4, currentSem=" + currentSemesterNum);
                return buildResponse(OjtStatus.NOT_APPLICABLE, false, null, activeSemester);
            }

            // Kỳ 5: đang chuẩn bị
            if (currentSemesterNum == 5) {
                debugLog("path: semester 5");
                return buildResponse(OjtStatus.PREPARING, false, null, activeSemester);
            }

            // Kỳ 6+: kiểm tra eligible_students
            Optional<EligibleStudent> eligibleOpt = eligibleStudentRepository.findByUser_UserIdAndSemester_SemesterId(
                    user.getUserId(), activeSemester.getSemesterId());

            if (eligibleOpt.isEmpty()) {
                debugLog("path: eligibleOpt empty");
                return buildResponse(
                        OjtStatus.ELIGIBLE_NO_PLACEMENT,
                        true,
                        "Bạn chưa được xếp vào danh sách OJT kỳ này. Vui lòng liên hệ phòng Đào tạo.",
                        activeSemester);
            }

            EligibleStudent eligible = eligibleOpt.get();

            // BLOCKED: cancelled by TM
            if ("CANCELLED".equalsIgnoreCase(eligible.getStatus())) {
                String reason = "Tài khoản OJT đã bị hủy bởi phòng Đào tạo"
                        + (eligible.getCancelledReason() != null ? ": " + eligible.getCancelledReason() : ".");
                return buildResponse(OjtStatus.BLOCKED, true, reason, activeSemester);
            }

            // PLACED: đã có assignment active
            Optional<EnterpriseAssignment> assignmentOpt =
                    enterpriseAssignmentRepository.findByStudent_UserIdAndSemester_Status(user.getUserId(), "ACTIVE");

            if (assignmentOpt.isPresent()) {
                EnterpriseAssignment assignment = assignmentOpt.get();
                String enterpriseName = assignment.getEnterprise() != null
                        ? assignment.getEnterprise().getCompanyName()
                        : null;

                List<WeeklyReport> reports =
                        weeklyReportRepository.findByAssignment_AssignmentId(assignment.getAssignmentId());
                long missedReports = reports.stream()
                        .filter(r -> "NOT_SUBMITTED".equals(r.getStatus()))
                        .count();
                long rejectedReports = reports.stream()
                        .filter(r -> "REJECTED".equals(r.getStatus()))
                        .count();

                // AT_RISK: có assignment nhưng miss nhiều báo cáo
                if (missedReports > 0 || rejectedReports >= 2) {
                    debugLog("AT_RISK: enterpriseName='" + enterpriseName + "', missedReports=" + missedReports
                            + ", rejectedReports=" + rejectedReports);
                    String reason = String.format(
                            "Bạn đã miss %d báo cáo tuần và/hoặc có %d báo cáo bị từ chối.",
                            missedReports, rejectedReports);
                    return buildResponseWithDetails(
                            OjtStatus.AT_RISK, true, reason, activeSemester, 0, 0, 0, enterpriseName);
                }

                // PLACED bình thường
                int appCount = (int) applicationRepository.countActiveApplications(user.getUserId());
                int interviewCount = interviewRepository
                        .findByApplication_Student_UserId(user.getUserId())
                        .size();
                int reportCount = (int) reports.stream()
                        .filter(r -> !"NOT_SUBMITTED".equals(r.getStatus()) && !"DRAFT".equals(r.getStatus()))
                        .count();

                return buildResponseWithDetails(
                        OjtStatus.PLACED,
                        false,
                        null,
                        activeSemester,
                        appCount,
                        interviewCount,
                        reportCount,
                        enterpriseName);
            }

            // Chưa placed — kiểm tra applications
            List<Application> applications = applicationRepository.findByStudent_UserId(user.getUserId());
            int activeAppCount = (int) applications.stream()
                    .filter(a -> a.getDeletedAt() == null)
                    .filter(a -> {
                        String s = a.getStatus().name();
                        return !"REJECTED".equals(s) && !"WITHDRAWN".equals(s) && !"SCREENING_REJECTED".equals(s);
                    })
                    .count();

            if (activeAppCount > 0) {
                // Đã apply, chờ DN phản hồi
                int interviewCount =
                        (int) interviewRepository.findByApplication_Student_UserId(user.getUserId()).stream()
                                .filter(i -> i.getCanceledAt() == null)
                                .filter(i -> "SCHEDULED".equals(i.getStatus()) || "CONFIRMED".equals(i.getStatus()))
                                .count();
                return buildResponseWithDetails(
                        OjtStatus.APPLIED,
                        false,
                        "Bạn đã nộp " + activeAppCount + " hồ sơ. Vui lòng chờ phản hồi từ doanh nghiệp.",
                        activeSemester,
                        activeAppCount,
                        interviewCount,
                        0,
                        null);
            }

            // Chưa có placement, chưa apply
            String riskReason = "Kỳ OJT đã bắt đầu. Bạn chưa có chỗ thực tập và chưa nộp hồ sơ nào. "
                    + "Vui lòng liên hệ phòng Đào tạo để được hỗ trợ phân bổ.";
            return buildResponseWithDetails(
                    OjtStatus.ELIGIBLE_NO_PLACEMENT, true, riskReason, activeSemester, 0, 0, 0, null);
        } catch (Exception e) {
            debugLog("EXCEPTION: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            return buildDefaultResponse();
        }
    }

    private OjtStatusResponse buildDefaultResponse() {
        return new OjtStatusResponse(
                OjtStatus.NOT_APPLICABLE,
                "Chưa có thông tin",
                "#9CA3AF",
                false,
                null,
                null,
                null,
                null,
                TRAINING_MANAGER_EMAIL,
                TRAINING_MANAGER_NAME,
                0,
                0,
                0,
                null,
                null);
    }

    private OjtStatusResponse buildResponse(OjtStatus status, boolean isUrgent, String riskReason, Semester semester) {
        return buildResponseWithDetails(status, isUrgent, riskReason, semester, 0, 0, 0, null);
    }

    private OjtStatusResponse buildResponseWithDetails(
            OjtStatus status,
            boolean isUrgent,
            String riskReason,
            Semester semester,
            int applicationCount,
            int interviewCount,
            int reportCount,
            String enterpriseName) {
        debugLog("buildResponseWithDetails: status=" + status + ", semester=" + semester.getName());
        String label = getStatusLabel(status);
        String color = getStatusColor(status);

        int daysUntilDeadline = 0;
        String deadlineLabel = null;
        if (semester.getEndDate() != null) {
            daysUntilDeadline = (int) ChronoUnit.DAYS.between(LocalDate.now(), semester.getEndDate());
            deadlineLabel = "Còn " + daysUntilDeadline + " ngày đến khi kết thúc kỳ";
        }

        SemesterEnterprise se = semesterEnterpriseRepository.findAll().stream()
                .filter(semEnt -> semEnt.getSemester().getSemesterId().equals(semester.getSemesterId()))
                .findFirst()
                .orElse(null);

        String supportEmail = TRAINING_MANAGER_EMAIL;
        String supportName = TRAINING_MANAGER_NAME;
        if (se != null && se.getEnterprise() != null) {
            // Nếu có enterprise được phân công, lấy TM của enterprise đó
            var tmUser = userRepository.findActiveUsersByRoleName("TRAINING_MANAGER").stream()
                    .findFirst()
                    .orElse(null);
            if (tmUser != null) {
                supportEmail = tmUser.getEmail();
                supportName = tmUser.getFullName();
            }
        }

        debugLog("buildResponseWithDetails: supportEmail=" + supportEmail + ", daysUntilDeadline=" + daysUntilDeadline);

        return new OjtStatusResponse(
                status,
                label,
                color,
                isUrgent,
                riskReason,
                daysUntilDeadline,
                deadlineLabel,
                enterpriseName,
                supportEmail,
                supportName,
                applicationCount,
                interviewCount,
                reportCount,
                semester.getSemesterId(),
                semester.getName());
    }

    private String getStatusLabel(OjtStatus status) {
        return switch (status) {
            case NOT_APPLICABLE -> "ĐANG HỌC KỲ THƯỜNG";
            case PREPARING -> "ĐANG CHUẨN BỊ OJT";
            case ELIGIBLE_NO_PLACEMENT -> "ACTION REQUIRED";
            case APPLIED -> "ĐÃ NỘP HỒ SƠ";
            case MATCHING_IN_PROGRESS -> "ĐANG XỬ LÝ MATCH";
            case PLACED -> "OJT IN PROGRESS";
            case AT_RISK -> "AT RISK — ACTION REQUIRED";
            case BLOCKED -> "BLOCKED";
        };
    }

    private String getStatusColor(OjtStatus status) {
        return switch (status) {
            case NOT_APPLICABLE -> "#9CA3AF"; // gray
            case PREPARING -> "#3B82F6"; // blue
            case ELIGIBLE_NO_PLACEMENT -> "#F59E0B"; // yellow/warning
            case APPLIED -> "#8B5CF6"; // purple
            case MATCHING_IN_PROGRESS -> "#E67E22"; // orange/amber
            case PLACED -> "#10B981"; // green
            case AT_RISK -> "#EF4444"; // red
            case BLOCKED -> "#991B1B"; // dark red
        };
    }
}
