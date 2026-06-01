package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.dto.request.TrainingWarningRequest;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.TrainingWarning;
import com.ueims.model.entity.User;
import com.ueims.service.TrainingWarningService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/training-warnings")
@RequiredArgsConstructor
public class TrainingWarningController {
    private final TrainingWarningService service;

    @GetMapping
    public ResponseEntity<List<TrainingWarning>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingWarning> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<TrainingWarning> create(@Valid @RequestBody TrainingWarningRequest request) {
        TrainingWarning entity = new TrainingWarning();
        entity.setWeekNumber(request.getWeekNumber());
        entity.setWarningMessage(request.getWarningMessage());

        if (request.getTmId() != null) {
            User tm = new User();
            tm.setUserId(request.getTmId());
            entity.setTm(tm);
        }

        if (request.getStudentId() != null) {
            User student = new User();
            student.setUserId(request.getStudentId());
            entity.setStudent(student);
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

    @PostMapping("/scan-late-reports")
    public ResponseEntity<java.util.Map<String, Object>> scanLateReports(
            @RequestParam("semesterId") UUID semesterId,
            @RequestParam("weekNumber") Integer weekNumber,
            @RequestParam("tmId") UUID tmId) {

        int count = service.scanAndSendLateWarnings(semesterId, weekNumber, tmId);
        return ResponseEntity.ok(
                java.util.Map.of("message", "Scanned and sent warnings successfully", "warningsSent", count));
    }
}
