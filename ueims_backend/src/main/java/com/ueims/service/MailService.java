package com.ueims.service;

import com.ueims.model.entity.Incident;
import com.ueims.model.entity.Interview;

public interface MailService {
    void sendPasswordResetMail(String to, String fullName, String token);

    void sendWelcomeMail(String to, String fullName, String tempPassword);

    void sendRosterWelcomeMail(String to, String fullName, String tempPassword);

    void sendPasswordChangedMail(String to, String fullName, String changedAt);

    void sendLateReportWarningMail(String to, String fullName, Integer weekNumber);

    void sendEnterpriseStatusNotification(String to, String contactPerson, String status, String reason);

    void sendInterviewScheduled(Interview interview);

    void sendInterviewRescheduled(Interview interview);

    void sendInterviewCanceled(Interview interview, String reason);

    void sendInterviewResult(Interview interview, String result, String notes);

    void sendIncidentReported(Incident incident);

    /**
     * At-Risk alert sent by a Training Manager to a student whose current OJT
     * status matches one of: UNPLACED, REPORT, DEADLINE, BLOCKED.
     * <p>
     * The HTML body is rendered from {@code at-risk-alert.html} and adapts its
     * content (heading, KPI list, recommended actions) based on
     * {@code riskCategory}.
     */
    void sendAtRiskAlertMail(
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
            String supervisorName);
}
