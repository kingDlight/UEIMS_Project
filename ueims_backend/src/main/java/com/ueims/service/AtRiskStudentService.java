package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.service.impl.AtRiskStudentResult;

public interface AtRiskStudentService {
    List<AtRiskStudentResult> getAtRiskStudentsBySemester(UUID semesterId);

    List<AtRiskStudentResult> getAtRiskStudentsBySemester(UUID semesterId, String riskCategory, Integer minPriority);

    int scanAndSendLateWarnings(UUID semesterId, Integer weekNumber, String userId);
}
