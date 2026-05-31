package com.ueims.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.response.EligibleStudentResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.Semester;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.service.EligibleStudentService;
import com.ueims.util.ExcelImportUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EligibleStudentServiceImpl implements EligibleStudentService {
    private final EligibleStudentRepository repository;
    private final SemesterRepository semesterRepository;

    @Override
    public List<EligibleStudent> findAll() {
        return repository.findAll();
    }

    @Override
    public EligibleStudent findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public EligibleStudent save(EligibleStudent entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public List<EligibleStudentResponse> importFromExcel(MultipartFile file, UUID semesterId) {
        Semester semester = semesterRepository
                .findById(semesterId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        List<EligibleStudent> parsed;
        try {
            parsed = ExcelImportUtil.parseEligibleStudents(file.getInputStream());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }

        List<EligibleStudent> toInsert = new ArrayList<>();
        int skipped = 0;

        for (EligibleStudent student : parsed) {
            if (repository.existsByStudentCodeAndSemester_SemesterId(student.getStudentCode(), semesterId)) {
                skipped++;
            } else {
                student.setSemester(semester);
                toInsert.add(student);
            }
        }

        if (skipped > 0) {
            log.warn("Skipped {} duplicate student(s) already in semester {}", skipped, semesterId);
        }

        List<EligibleStudent> savedStudents = repository.saveAll(toInsert);

        return savedStudents.stream()
                .map(s -> EligibleStudentResponse.builder()
                        .studentCode(s.getStudentCode())
                        .fullName(s.getFullName())
                        .email(s.getEmail())
                        .major(s.getMajor())
                        .gpa(s.getGpa())
                        .currentSemester(s.getCurrentSemester())
                        .build())
                .collect(Collectors.toList());
    }
}
