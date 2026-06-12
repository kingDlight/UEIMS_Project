package com.ueims.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.ueims.dto.request.EligibleStudentRequest;
import com.ueims.dto.response.EligibleStudentDTO;
import com.ueims.dto.response.EligibleStudentResponse;
import com.ueims.mapper.EligibleStudentMapper;
import com.ueims.service.EligibleStudentService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/eligible-students")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EligibleStudentController {
    EligibleStudentService service;
    EligibleStudentMapper mapper;

    @GetMapping
    public ResponseEntity<List<EligibleStudentDTO>> getAll() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EligibleStudentDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<EligibleStudentDTO> create(@Valid @RequestBody EligibleStudentRequest request) {
        return ResponseEntity.ok(mapper.toDto(service.save(mapper.toEntity(request))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    @PostMapping("/upload")
    public ResponseEntity<List<EligibleStudentResponse>> uploadExcel(
            @RequestParam("file") MultipartFile file, @RequestParam("semesterId") UUID semesterId) {
        return ResponseEntity.ok(service.importFromExcel(file, semesterId));
    }

    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    @PostMapping("/finalize-ojt")
    public ResponseEntity<java.util.Map<String, Object>> finalizeOjtList(@RequestBody List<UUID> studentIds) {
        int count = service.finalizeOjtList(studentIds);
        return ResponseEntity.ok(java.util.Map.of("message", "Finalized OJT list", "updatedCount", count));
    }

    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    @PutMapping("/{id}/cancel")
    public ResponseEntity<EligibleStudentDTO> cancelOjtResult(
            @PathVariable UUID id, @Valid @RequestBody com.ueims.dto.request.CancelOjtRequest request) {
        return ResponseEntity.ok(mapper.toDto(service.cancelOjtResult(id, request.getReason())));
    }

    // đây là file nhị phân, nếu không file lưu về sẽ bị lỗi/hỏng. FE chú ý
    @PreAuthorize("hasRole('TRAINING_MANAGER')")
    @GetMapping("/export-ojt")
    public ResponseEntity<byte[]> exportOjtStudents(@RequestParam("semesterId") UUID semesterId) {
        byte[] data = service.exportOjtStudentsToExcel(semesterId);
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"OJT_Students.xlsx\"");
        headers.setContentType(
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        return ResponseEntity.ok().headers(headers).body(data);
    }
}
