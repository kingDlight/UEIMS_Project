package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.ReportFeedback;

public interface ReportFeedbackService {
    List<ReportFeedback> findAll();

    ReportFeedback findById(UUID id);

    ReportFeedback save(ReportFeedback entity);

    void deleteById(UUID id);
}
