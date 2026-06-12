package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.StudentEnterpriseFeedback;

public interface StudentEnterpriseFeedbackService {
    List<StudentEnterpriseFeedback> findAll();

    List<StudentEnterpriseFeedback> findMyFeedbacks(UUID studentId);

    StudentEnterpriseFeedback findById(UUID id);

    StudentEnterpriseFeedback save(StudentEnterpriseFeedback entity);

    void deleteById(UUID id);
}
