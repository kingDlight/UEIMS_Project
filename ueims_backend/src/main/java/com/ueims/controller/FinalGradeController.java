package com.ueims.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.FinalGradeRequest;
import com.ueims.model.entity.FinalGrade;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.service.FinalGradeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/final-grades")
@RequiredArgsConstructor
public class FinalGradeController {
    private final FinalGradeService service;

    @GetMapping
    public ResponseEntity<List<FinalGrade>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FinalGrade> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<FinalGrade> create(@Valid @RequestBody FinalGradeRequest request) {
        FinalGrade entity = new FinalGrade();
        entity.setEnterpriseTotalScore(request.getEnterpriseTotalScore());
        // Determine final grade: use provided finalGrade if present, otherwise derive from enterpriseTotalScore
        BigDecimal finalGrade = request.getFinalGrade();
        if (finalGrade == null) {
            finalGrade = request.getEnterpriseTotalScore();
        }
        if (finalGrade == null) {
            finalGrade = BigDecimal.ZERO;
        }

        // Round to 1 decimal place to match DB precision
        finalGrade = finalGrade.setScale(1, RoundingMode.HALF_UP);
        entity.setFinalGrade(finalGrade);

        // Compute overall status based on threshold: >= 5.0 => PASS, otherwise FAIL
        BigDecimal passThreshold = new BigDecimal("5.0");
        String overallStatus = finalGrade.compareTo(passThreshold) >= 0 ? "PASS" : "FAIL";
        entity.setOverallStatus(overallStatus);

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

        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
