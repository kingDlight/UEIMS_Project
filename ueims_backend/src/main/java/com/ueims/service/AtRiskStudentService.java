package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.AtRiskStudent;

public interface AtRiskStudentService {
    List<AtRiskStudent> getAtRiskStudentsBySemester(UUID semesterId);
}
