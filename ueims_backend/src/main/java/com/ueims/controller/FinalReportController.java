package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import java.util.UUID;
import com.ueims.model.entity.FinalReport;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;

import com.ueims.model.entity.FinalReport;
import com.ueims.service.FinalReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/final-reports")
@RequiredArgsConstructor
public class FinalReportController {
    private final FinalReportService service;
    private final EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    @GetMapping
    public ResponseEntity<List<FinalReport>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FinalReport> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<FinalReport> create(@Valid @RequestBody FinalReport entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<FinalReport> uploadFinalReport(@RequestParam("file") MultipartFile file,
                                                         @RequestParam("assignmentId") UUID assignmentId) {
        if (file == null || file.isEmpty()) throw new AppException(ErrorCode.FIELD_REQUIRED);
        if (!StringUtils.getFilename(file.getOriginalFilename()).toLowerCase().endsWith(".pdf")) {
            throw new AppException(ErrorCode.INVALID_CV_FORMAT);
        }
        if (file.getSize() > 5 * 1024 * 1024) throw new AppException(ErrorCode.CV_SIZE_EXCEEDED);

        EnterpriseAssignment assignment = enterpriseAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.FIELD_REQUIRED));

        try {
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "final-reports");
            Files.createDirectories(uploadDir);
            String filename = assignmentId.toString() + "_" + System.currentTimeMillis() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
            Path dest = uploadDir.resolve(filename);
            file.transferTo(dest.toFile());

            FinalReport fr = FinalReport.builder()
                    .assignment(assignment)
                    .fileUrl("/uploads/final-reports/" + filename)
                    .fileSizeBytes((int) file.getSize())
                    .build();

            FinalReport saved = service.save(fr);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
}
