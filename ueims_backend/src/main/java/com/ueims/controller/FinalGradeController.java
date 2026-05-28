package com.ueims.controller;

import com.ueims.model.entity.FinalGrade;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.dto.request.FinalGradeRequest;
import com.ueims.service.FinalGradeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

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
    public ResponseEntity<FinalGrade> create(@RequestBody FinalGradeRequest request) {
        FinalGrade entity = new FinalGrade();
        entity.setEnterpriseTotalScore(request.getEnterpriseTotalScore());
        entity.setFinalGrade(request.getFinalGrade());
        entity.setOverallStatus(request.getOverallStatus());
        
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
