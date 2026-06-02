package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.FinalReport;

public interface FinalReportService {
    List<FinalReport> findAll();

    FinalReport findById(UUID id);

    FinalReport save(FinalReport entity);

    FinalReport uploadFinalReport(UUID assignmentId, org.springframework.web.multipart.MultipartFile file);

    void deleteById(UUID id);
}
