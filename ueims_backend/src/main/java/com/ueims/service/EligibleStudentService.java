package com.ueims.service;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.ueims.model.entity.EligibleStudent;

public interface EligibleStudentService {
    List<EligibleStudent> findAll();

    EligibleStudent findById(UUID id);

    EligibleStudent save(EligibleStudent entity);

    void deleteById(UUID id);

    List<com.ueims.dto.response.EligibleStudentResponse> importFromExcel(MultipartFile file, UUID semesterId);

    int finalizeOjtList(UUID semesterId);
}
