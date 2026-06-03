package com.ueims.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.FinalReport;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.FinalReportRepository;
import com.ueims.service.FinalReportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FinalReportServiceImpl implements FinalReportService {
    private final FinalReportRepository repository;
    private final EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    @Override
    public List<FinalReport> findAll() {
        return repository.findAll();
    }

    @Override
    public FinalReport findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public FinalReport save(FinalReport entity) {
        return repository.save(entity);
    }

    @Override
    public FinalReport uploadFinalReport(UUID assignmentId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }

        String filename = StringUtils.getFilename(file.getOriginalFilename());
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new AppException(ErrorCode.FINAL_REPORT_INVALID_FORMAT);
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new AppException(ErrorCode.FINAL_REPORT_SIZE_EXCEEDED);
        }

        EnterpriseAssignment assignment = enterpriseAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.FIELD_REQUIRED));

        try {
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "final-reports");
            Files.createDirectories(uploadDir);
            String stored = assignmentId.toString() + "_" + System.currentTimeMillis() + "_" + StringUtils.cleanPath(filename);
            Path path = uploadDir.resolve(stored);
            file.transferTo(path.toFile());

            FinalReport report = repository.findByAssignment_AssignmentId(assignmentId)
                    .orElse(FinalReport.builder().assignment(assignment).build());
            report.setAssignment(assignment);
            report.setFileUrl("/uploads/final-reports/" + stored);
            report.setFileSizeBytes((int) file.getSize());
            return repository.save(report);
        } catch (IOException e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
