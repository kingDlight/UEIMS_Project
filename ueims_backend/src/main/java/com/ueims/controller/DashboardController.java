package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ueims.model.entity.SemesterStatistics;
import com.ueims.repository.SemesterStatisticsRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final SemesterStatisticsRepository semesterStatisticsRepository;

    @GetMapping("/statistics")
    public ResponseEntity<List<SemesterStatistics>> getAllStatistics() {
        return ResponseEntity.ok(semesterStatisticsRepository.findAll());
    }

    @GetMapping("/statistics/{semesterId}")
    public ResponseEntity<SemesterStatistics> getStatisticsBySemesterId(@PathVariable UUID semesterId) {
        return semesterStatisticsRepository
                .findById(semesterId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
