package com.ueims.service;

import com.ueims.model.entity.FinalReport;
import java.util.List;
import java.util.UUID;

public interface FinalReportService {
    List<FinalReport> findAll();
    FinalReport findById(UUID id);
    FinalReport save(FinalReport entity);
    void deleteById(UUID id);
}
