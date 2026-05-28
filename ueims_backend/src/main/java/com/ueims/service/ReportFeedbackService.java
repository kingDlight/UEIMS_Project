package com.ueims.service;

import com.ueims.model.entity.ReportFeedback;
import java.util.List;
import java.util.UUID;

public interface ReportFeedbackService {
    List<ReportFeedback> findAll();
    ReportFeedback findById(UUID id);
    ReportFeedback save(ReportFeedback entity);
    void deleteById(UUID id);
}
