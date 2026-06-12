package com.ueims.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.FinalGradeRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.FinalGrade;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.FinalGradeRepository;
import com.ueims.service.FinalGradeService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FinalGradeServiceImpl implements FinalGradeService {
    FinalGradeRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<FinalGrade> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public FinalGrade findById(UUID id) {
        return repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.FINAL_GRADE_NOT_FOUND));
    }

    @Override
    @Transactional
    public FinalGrade create(FinalGradeRequest request) {
        FinalGrade entity = new FinalGrade();
        entity.setEnterpriseTotalScore(request.getEnterpriseTotalScore());

        // Logic tính điểm: Ưu tiên finalGrade nếu có, nếu không lấy enterpriseTotalScore
        BigDecimal finalGrade = request.getFinalGrade();
        if (finalGrade == null) {
            finalGrade = request.getEnterpriseTotalScore();
        }
        if (finalGrade == null) {
            finalGrade = BigDecimal.ZERO;
        }

        // Làm tròn 1 chữ số thập phân theo quy định DB
        finalGrade = finalGrade.setScale(1, RoundingMode.HALF_UP);
        entity.setGradeValue(finalGrade);

        // Xác định trạng thái PASS/FAIL dựa trên ngưỡng 5.0
        BigDecimal passThreshold = new BigDecimal("5.0");
        String overallStatus = finalGrade.compareTo(passThreshold) >= 0 ? "PASS" : "FAIL";
        entity.setOverallStatus(overallStatus);

        // Map các quan hệ thực thể (mapping IDs)
        if (request.getStudentId() != null) {
            User student = new User();
            student.setUserId(request.getStudentId());
            entity.setStudent(student);
        }

        if (request.getTmId() != null) {
            User tm = new User();
            tm.setUserId(request.getTmId());
            entity.setTm(tm);
        }

        if (request.getSemesterId() != null) {
            Semester semester = new Semester();
            semester.setSemesterId(request.getSemesterId());
            entity.setSemester(semester);
        }

        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
