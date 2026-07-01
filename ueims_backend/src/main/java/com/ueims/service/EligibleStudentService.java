package com.ueims.service;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.response.EligibleStudentResponse;
import com.ueims.dto.response.StudentImportResult;
import com.ueims.model.entity.EligibleStudent;

public interface EligibleStudentService {
    List<EligibleStudent> findAll();

    List<EligibleStudent> findBySemesterId(UUID semesterId);

    EligibleStudent findById(UUID id);

    EligibleStudent save(EligibleStudent entity);

    EligibleStudent update(UUID id, com.ueims.dto.request.EligibleStudentUpdateRequest request);

    void deleteById(UUID id);

    List<EligibleStudentResponse> importFromExcel(MultipartFile file, UUID semesterId);

    /**
     * TM bulk upload — parses the Excel, then for every row:
     *  - upserts a {@code User} (matched by email, then by studentCode via
     *    {@code StudentProfile})
     *  - upserts the linked {@code StudentProfile} with classCode, dob, gender,
     *    address, links, skills, bio
     *  - inserts a new {@code EligibleStudent} record for the given semester
     *  - resets the user's password to {@code Password@123} (mustChangePassword
     *    left untouched — see TM-101 product decision)
     *  - assigns the STUDENT role to brand-new users
     *
     * Existing {@code eligible_students} rows for the same (studentCode, semester)
     * pair are skipped, not duplicated.
     */
    StudentImportResult importRoster(MultipartFile file, UUID semesterId);

    int finalizeOjtList(List<UUID> studentIds);

    byte[] exportOjtStudentsToExcel(UUID semesterId);

    EligibleStudent cancelOjtResult(UUID id, String reason);

    /** TM ghi chú deferred reason cho SV chưa được placement — lưu lại sự cố để kì sau xử lý. */
    EligibleStudent deferStudent(UUID eligibleId, String reason);
}
