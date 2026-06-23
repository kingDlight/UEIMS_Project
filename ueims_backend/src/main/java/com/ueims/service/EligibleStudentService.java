package com.ueims.service;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.response.EligibleStudentResponse;
import com.ueims.model.entity.EligibleStudent;

public interface EligibleStudentService {
    List<EligibleStudent> findAll();

    List<EligibleStudent> findBySemesterId(UUID semesterId);

    EligibleStudent findById(UUID id);

    EligibleStudent save(EligibleStudent entity);

    EligibleStudent update(UUID id, com.ueims.dto.request.EligibleStudentUpdateRequest request);

    void deleteById(UUID id);

    List<EligibleStudentResponse> importFromExcel(MultipartFile file, UUID semesterId);

    int finalizeOjtList(List<UUID> studentIds);

    byte[] exportOjtStudentsToExcel(UUID semesterId);

    EligibleStudent cancelOjtResult(UUID id, String reason);

    /** TM ghi chú deferred reason cho SV chưa được placement — lưu lại sự cố để kì sau xử lý. */
    EligibleStudent deferStudent(UUID eligibleId, String reason);
}
