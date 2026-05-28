package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.Semester;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.service.EligibleStudentService;
import com.ueims.util.ExcelImportUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
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
    public List<EligibleStudent> importFromExcel(MultipartFile file, UUID semesterId) {
        Semester semester =
                semesterRepository.findById(semesterId).orElseThrow(() -> new RuntimeException("Semester not found"));

        try {
            List<EligibleStudent> students = ExcelImportUtil.parseEligibleStudents(file.getInputStream());
            for (EligibleStudent student : students) {
                student.setSemester(semester);
            }
            return repository.saveAll(students);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_EXCEL_FORMAT);
        }
    }
}
