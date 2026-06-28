package com.ueims.service;

import com.ueims.model.entity.Incident;
import com.ueims.model.entity.Interview;

public interface MailService {
    void sendPasswordResetMail(String to, String fullName, String token);

    void sendWelcomeMail(String to, String fullName, String tempPassword);

    void sendPasswordChangedMail(String to, String fullName, String changedAt);

    void sendLateReportWarningMail(String to, String fullName, Integer weekNumber);

    void sendEnterpriseStatusNotification(String to, String contactPerson, String status, String reason);

    void sendInterviewScheduled(Interview interview);

    void sendInterviewRescheduled(Interview interview);

    void sendInterviewCanceled(Interview interview, String reason);

    void sendInterviewResult(Interview interview, String result, String notes);

    void sendIncidentReported(Incident incident);
}
