package com.ueims.service.impl;

import java.util.ArrayList;
import java.util.List;

import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.ueims.model.entity.Incident;
import com.ueims.model.entity.Interview;
import com.ueims.service.MailService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MailServiceImpl implements MailService {

    private static final String VAR_FULL_NAME = "fullName";
    private static final String VAR_SUBJECT = "subject";
    private static final String PATH_LOGIN = "/login";
    private static final String VAR_LOGIN_URL = "loginUrl";

    JavaMailSender javaMailSender;
    TemplateEngine templateEngine;

    @Value("${app.base-url:http://localhost:5173}")
    @NonFinal
    String appBaseUrl;

    // ===== Password Reset =====
    @Async("mailTaskExecutor")
    public void sendPasswordResetMail(String to, String fullName, String token) {
        String resetUrl = appBaseUrl + "/reset-password?token=" + token;
        String subject = "Password Reset Request — UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("resetUrl", resetUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("password-reset", ctx);
        sendHtml(to, subject, html);

        log.info("Password reset email sent to: {}", to);
    }

    // ===== Welcome Email =====
    @Async("mailTaskExecutor")
    public void sendWelcomeMail(String to, String fullName, String tempPassword) {
        String loginUrl = appBaseUrl + PATH_LOGIN;
        String subject = "Welcome to UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("email", to);
        ctx.setVariable("tempPassword", tempPassword);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("welcome", ctx);
        sendHtml(to, subject, html);

        log.info("Welcome email sent to: {}", to);
    }

    /**
     * Welcome email sent after a TM roster import creates a brand-new student
     * account. Reuses the standard {@code welcome} template so the message
     * format stays consistent across admin-created and roster-imported users.
     */
    @Async("mailTaskExecutor")
    public void sendRosterWelcomeMail(String to, String fullName, String tempPassword) {
        String loginUrl = appBaseUrl + PATH_LOGIN;
        String subject = "Your UEIMS Account Has Been Created — UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("email", to);
        ctx.setVariable("tempPassword", tempPassword);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("welcome", ctx);
        sendHtml(to, subject, html);

        log.info("Roster account creation email sent to: {}", to);
    }

    // ===== Password Changed =====
    @Async("mailTaskExecutor")
    public void sendPasswordChangedMail(String to, String fullName, String changedAt) {
        String loginUrl = appBaseUrl + PATH_LOGIN;
        String subject = "Your Password Has Been Changed — UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("changedAt", changedAt);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("password-changed", ctx);
        sendHtml(to, subject, html);

        log.info("Password changed notification email sent to: {}", to);
    }

    // ===== Late Report Warning =====
    @Async("mailTaskExecutor")
    public void sendLateReportWarningMail(String to, String fullName, Integer weekNumber) {
        String loginUrl = appBaseUrl + PATH_LOGIN;
        String subject = "Warning: Late Weekly Report Submission — Week " + weekNumber + " — UEIMS";

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable("weekNumber", weekNumber);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("late-report-warning", ctx);
        sendHtml(to, subject, html);

        log.info("Late weekly report warning for week {} sent to: {}", weekNumber, to);
    }

    // ===== Enterprise Status Notification (UC-19) =====
    @Async("mailTaskExecutor")
    public void sendEnterpriseStatusNotification(String to, String contactPerson, String status, String reason) {
        String subject = "Enterprise Registration Review Result — UEIMS";
        String loginUrl = appBaseUrl + PATH_LOGIN;

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, contactPerson);
        ctx.setVariable("status", status);
        ctx.setVariable("reason", reason);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable(VAR_SUBJECT, subject);

        String html = templateEngine.process("enterprise-status", ctx);
        sendHtml(to, subject, html);

        log.info("Enterprise status notification ({}) sent to: {}", status, to);
    }

    // ===== Interview notifications (UC-43 / UC-44) =====
    @Async("mailTaskExecutor")
    public void sendInterviewScheduled(Interview interview) {
        sendInterviewEmail(interview, "interview-scheduled", "New Interview Scheduled — UEIMS", null);
    }

    @Async("mailTaskExecutor")
    public void sendInterviewRescheduled(Interview interview) {
        sendInterviewEmail(interview, "interview-rescheduled", "Interview Rescheduled — UEIMS", null);
    }

    @Async("mailTaskExecutor")
    public void sendInterviewCanceled(Interview interview, String reason) {
        sendInterviewEmail(interview, "interview-canceled", "Interview Canceled — UEIMS", reason);
    }

    @Async("mailTaskExecutor")
    public void sendInterviewResult(Interview interview, String result, String notes) {
        sendInterviewEmail(
                interview,
                "PASS".equalsIgnoreCase(result) ? "interview-result-pass" : "interview-result-fail",
                "Interview Result — UEIMS",
                notes);
    }

    public void sendIncidentReported(Incident incident) {
        try {
            // Notify reporter + all training managers
            String reporterEmail =
                    incident.getReportedBy() != null ? incident.getReportedBy().getEmail() : null;
            if (reporterEmail == null) return;
            Context ctx = new Context();
            ctx.setVariable(VAR_FULL_NAME, incident.getReportedBy().getFullName());
            ctx.setVariable(VAR_SUBJECT, "Incident Report Received — UEIMS");
            ctx.setVariable("category", incident.getCategory());
            ctx.setVariable("description", incident.getDescription());
            String html = templateEngine.process("incident-reported", ctx);
            sendHtml(reporterEmail, "Incident Report Received — UEIMS", html);
        } catch (Exception e) {
            log.warn("[IncidentEmail] Failed: {}", e.getMessage());
        }
    }

    // ===== At-Risk Student Alert (UC-37) =====
    @Async("mailTaskExecutor")
    public void sendAtRiskAlertMail(
            String to,
            String fullName,
            String studentCode,
            String riskCategory,
            String riskCategoryLabel,
            String riskReason,
            String semesterCode,
            Integer priorityScore,
            Integer daysAtRisk,
            Integer missedReports,
            Integer rejectedReports,
            String companyName,
            String supervisorName) {

        String loginUrl = appBaseUrl + PATH_LOGIN;
        String subject = buildAtRiskSubject(riskCategoryLabel, studentCode);

        Context ctx = new Context();
        ctx.setVariable(VAR_FULL_NAME, fullName);
        ctx.setVariable(VAR_SUBJECT, subject);
        ctx.setVariable(VAR_LOGIN_URL, loginUrl);
        ctx.setVariable("studentCode", studentCode);
        ctx.setVariable("riskCategory", riskCategory);
        ctx.setVariable("riskCategoryLabel", riskCategoryLabel);
        ctx.setVariable("riskReason", riskReason);
        ctx.setVariable("semesterCode", semesterCode);
        ctx.setVariable("priorityScore", priorityScore == null ? 0 : priorityScore);
        ctx.setVariable("daysAtRisk", daysAtRisk == null ? 0 : daysAtRisk);
        ctx.setVariable("missedReports", missedReports == null ? 0 : missedReports);
        ctx.setVariable("rejectedReports", rejectedReports == null ? 0 : rejectedReports);
        ctx.setVariable("companyName", companyName);
        ctx.setVariable("supervisorName", supervisorName);
        ctx.setVariable(
                "recommendations",
                buildAtRiskRecommendations(riskCategory, daysAtRisk, missedReports, rejectedReports, companyName));

        String html = templateEngine.process("at-risk-alert", ctx);
        sendHtml(to, subject, html);

        log.info("At-Risk alert email [{}] sent to: {} ({})", riskCategory, to, studentCode);
    }

    private String buildAtRiskSubject(String riskCategoryLabel, String studentCode) {
        String label =
                (riskCategoryLabel == null || riskCategoryLabel.isBlank()) ? "At-Risk Student" : riskCategoryLabel;
        String code = (studentCode == null || studentCode.isBlank()) ? "" : " — " + studentCode;
        return "[" + label + "] Internship Status Alert" + code + " — UEIMS";
    }

    private List<String> buildAtRiskRecommendations(
            String riskCategory,
            Integer daysAtRisk,
            Integer missedReports,
            Integer rejectedReports,
            String companyName) {
        List<String> actions = new ArrayList<>();
        if ("UNPLACED".equalsIgnoreCase(riskCategory)) {
            actions.add("Log in to UEIMS to browse enterprises currently hiring in your major.");
            actions.add(
                    "Refresh your CV and personal profile if it has not been updated in 30+ days — recruiters prioritize the latest profiles.");
            actions.add("Apply to at least 3 enterprises every week until you secure a placement.");
            actions.add(
                    (daysAtRisk != null && daysAtRisk >= 14)
                            ? "You have exceeded the 14-day placement deadline — a Training Manager will proactively reach out within the next 48 hours."
                            : "If you remain unplaced after 7 days, please contact your Training Manager for support.");
        } else if ("REPORT".equalsIgnoreCase(riskCategory) || "DEADLINE".equalsIgnoreCase(riskCategory)) {
            actions.add("Log in to UEIMS now and submit any missing weekly report within 24 hours.");
            int missed = missedReports == null ? 0 : missedReports;
            int rejected = rejectedReports == null ? 0 : rejectedReports;
            if (missed > 0) {
                actions.add("You are missing " + missed + " report(s) — submit all of them before the semester ends.");
            }
            if (rejected > 0) {
                actions.add("You have " + rejected
                        + " report(s) rejected — review your supervisor's feedback and revise before resubmitting.");
            }
            if (companyName != null && !companyName.isBlank()) {
                actions.add("Reach out to your supervisor at " + companyName
                        + " if you face any difficulty during the internship week.");
            }
            actions.add("Plan to submit your weekly report before 23:59 every Sunday to avoid being marked as late.");
        } else if ("BLOCKED".equalsIgnoreCase(riskCategory)) {
            actions.add(
                    "Log in to UEIMS and check the \"Notices\" section to see the specific reason your OJT was cancelled.");
            actions.add(
                    "Contact your Training Manager within 3 business days for guidance on how to remediate or re-register.");
            actions.add(
                    "If you believe the cancellation decision was made in error, please submit an appeal with supporting evidence to the support email.");
        } else {
            actions.add("Log in to UEIMS to check the detailed status of your current internship.");
            actions.add("Contact your Training Manager if you need further assistance.");
        }
        return actions;
    }

    private void sendInterviewEmail(Interview interview, String template, String subject, String extra) {
        try {
            String to = interview.getApplication() != null
                            && interview.getApplication().getStudent() != null
                    ? interview.getApplication().getStudent().getEmail()
                    : null;
            if (to == null) {
                log.warn("[InterviewEmail] No recipient email for interview {}", interview.getInterviewId());
                return;
            }
            String studentName = interview.getApplication().getStudent().getFullName();
            Context ctx = new Context();
            ctx.setVariable(VAR_FULL_NAME, studentName);
            ctx.setVariable(VAR_SUBJECT, subject);
            ctx.setVariable("scheduledTime", interview.getScheduledTime());
            ctx.setVariable("location", interview.getLocation());
            ctx.setVariable("meetingLink", interview.getMeetingLink());
            ctx.setVariable(
                    "jobTitle",
                    interview.getApplication().getJobPost() != null
                            ? interview.getApplication().getJobPost().getTitle()
                            : "");
            ctx.setVariable("result", interview.getResult());
            ctx.setVariable("reason", extra);
            String html = templateEngine.process(template, ctx);
            sendHtml(to, subject, html);
        } catch (Exception e) {
            log.warn(
                    "[InterviewEmail] Template '{}' may not exist; falling back to plain text. err={}",
                    template,
                    e.getMessage());
        }
    }

    private void sendHtml(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            // Headers help Gmail/Spam filters route the message to Inbox instead of Spam:
            // - List-Unsubscribe: complies with RFC 8058
            // - X-Mailer: identifies the message as transactional mail
            // - Precedence: bulk
            // - Priority: normal (not urgent = lower spam score)
            message.setHeader("List-Unsubscribe", "<mailto:" + to + "?subject=unsubscribe>");
            message.setHeader("X-Mailer", "UEIMS Mailer 1.0");
            message.setHeader("Precedence", "bulk");
            message.setHeader("Priority", "normal");
            message.setHeader("X-Priority", "3 (Normal)");

            ClassPathResource logoFile = new ClassPathResource("logo_ueims.png");
            helper.addInline("logoImage", logoFile);

            javaMailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            // Log body to help with debugging
            log.warn("=== EMAIL BODY (fallback log) ===");
            log.warn("To: {}", to);
            log.warn("Subject: {}", subject);
            log.warn("Body:\n{}", htmlBody);
            log.warn("==================================");
        }
    }
}
