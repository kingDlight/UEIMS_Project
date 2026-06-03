package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.AtRiskStudent;
import com.ueims.service.AtRiskStudentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/at-risk-students")
@RequiredArgsConstructor
public class AtRiskStudentController {

    private final AtRiskStudentService atRiskStudentService;

    @GetMapping
    public ResponseEntity<List<AtRiskStudent>> getAtRiskStudents(@RequestParam UUID semesterId) {
        List<AtRiskStudent> atRiskStudents = atRiskStudentService.getAtRiskStudentsBySemester(semesterId);
        return ResponseEntity.ok(atRiskStudents);
    }
}
