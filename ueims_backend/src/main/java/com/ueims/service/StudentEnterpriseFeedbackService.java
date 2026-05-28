package com.ueims.service;

import com.ueims.model.entity.StudentEnterpriseFeedback;
import java.util.List;
import java.util.UUID;

public interface StudentEnterpriseFeedbackService {
    List<StudentEnterpriseFeedback> findAll();
    StudentEnterpriseFeedback findById(UUID id);
    StudentEnterpriseFeedback save(StudentEnterpriseFeedback entity);
    void deleteById(UUID id);
}
