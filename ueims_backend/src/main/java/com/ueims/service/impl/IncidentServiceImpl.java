package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ueims.dto.request.IncidentReportRequest;
import com.ueims.dto.request.IncidentRequest;
import com.ueims.dto.request.IncidentResolveRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.Incident;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.IncidentRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.IncidentService;
import com.ueims.service.MailService;
import com.ueims.service.NotificationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IncidentServiceImpl implements IncidentService {
    IncidentRepository repository;
    EnterpriseAssignmentRepository assignmentRepository;
    UserRepository userRepository;
    MailService mailService;
    NotificationService notificationService;

    private static final String ASSIGNMENT_NOT_FOUND = "Assignment not found";

    private static final Map<String, String> CATEGORY_ALIAS = Map.of(
            "ATTENDANCE", "PROLONGED_ABSENCE",
            "ATTITUDE", "POOR_ATTITUDE",
            "CONFIDENTIALITY", "CONFIDENTIALITY_BREACH",
            "PERFORMANCE", "POOR_ATTITUDE",
            "SAFETY", "DISCIPLINARY_VIOLATION",
            "OTHER", "OTHER"
    );

    private static String normalizeCategory(String raw) {
        if (raw == null) return null;
        String upper = raw.trim().toUpperCase().replace(' ', '_');
        return CATEGORY_ALIAS.getOrDefault(upper, upper);
    }

    @Override
    public List<Incident> findAll() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        if (currentUser != null && currentUser.getEnterprise() != null) {
            return repository.findAll().stream()
                    .filter(inc -> inc.getAssignment() != null
                            && inc.getAssignment().getEnterprise() != null
                            && inc.getAssignment()
                                    .getEnterprise()
                                    .getEnterpriseId()
                                    .equals(currentUser.getEnterprise().getEnterpriseId()))
                    .toList();
        }
        return repository.findAll();
    }

    @Override
    public Incident findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Incident save(Incident entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public Incident createIncident(IncidentRequest request) {
        EnterpriseAssignment assignment = assignmentRepository
                .findById(request.getAssignmentId())
                .orElseThrow(() -> new IllegalArgumentException(ASSIGNMENT_NOT_FOUND));

        User reportedBy = userRepository
                .findById(request.getReportedById())
                .orElseThrow(() -> new IllegalArgumentException("Reported user not found"));

        User resolvedBy = null;
        if (request.getResolvedById() != null) {
            resolvedBy = userRepository
                    .findById(request.getResolvedById())
                    .orElseThrow(() -> new IllegalArgumentException("Resolved user not found"));
        }

        Incident incident = Incident.builder()
                .assignment(assignment)
                .reportedBy(reportedBy)
                .category(request.getCategory())
                .description(request.getDescription())
                .evidenceUrls(request.getEvidenceUrls())
                .status(request.getStatus() != null ? request.getStatus() : "OPEN")
                .resolutionNote(request.getResolutionNote())
                .resolvedBy(resolvedBy)
                .build();

        if (resolvedBy != null && incident.getResolvedAt() == null) {
            incident.setResolvedAt(LocalDateTime.now());
        }

        return repository.save(incident);
    }

    @Override
    public Incident updateIncident(UUID id, IncidentRequest request) {
        Incident incident =
                repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Incident not found"));

        EnterpriseAssignment assignment = assignmentRepository
                .findById(request.getAssignmentId())
                .orElseThrow(() -> new IllegalArgumentException(ASSIGNMENT_NOT_FOUND));

        User reportedBy = userRepository
                .findById(request.getReportedById())
                .orElseThrow(() -> new IllegalArgumentException("Reported user not found"));

        User resolvedBy = null;
        if (request.getResolvedById() != null) {
            resolvedBy = userRepository
                    .findById(request.getResolvedById())
                    .orElseThrow(() -> new IllegalArgumentException("Resolved user not found"));
        }

        incident.setAssignment(assignment);
        incident.setReportedBy(reportedBy);
        incident.setCategory(request.getCategory());
        incident.setDescription(request.getDescription());
        incident.setEvidenceUrls(request.getEvidenceUrls());
        incident.setStatus(request.getStatus() != null ? request.getStatus() : "OPEN");
        incident.setResolutionNote(request.getResolutionNote());

        if (resolvedBy != null && incident.getResolvedBy() == null) {
            incident.setResolvedAt(LocalDateTime.now());
        } else if (resolvedBy == null) {
            incident.setResolvedAt(null);
        }
        incident.setResolvedBy(resolvedBy);

        return repository.save(incident);
    }

    @Override
    public Incident reportIncident(IncidentReportRequest request) {
        // BR-41: Category and Description are mandatory
        if (request.getCategory() == null || request.getCategory().isBlank()) {
            throw new AppException(ErrorCode.FIELD_REQUIRED, "Category is required");
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new AppException(ErrorCode.FIELD_REQUIRED, "Description is required");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser =
                userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        EnterpriseAssignment assignment = assignmentRepository
                .findById(request.getAssignmentId())
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND, ASSIGNMENT_NOT_FOUND));

        boolean isStudent = assignment.getStudent().getUserId().equals(currentUser.getUserId());
        boolean isEnterprise = assignment.getEnterprise() != null
                && currentUser.getEnterprise() != null
                && assignment
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId());

        if (!isStudent && !isEnterprise) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Incident incident = Incident.builder()
                .assignment(assignment)
                .reportedBy(currentUser)
                .category(normalizeCategory(request.getCategory()))
                .description(request.getDescription())
                .evidenceUrls(request.getEvidenceUrls())
                .status("OPEN")
                .build();

        Incident saved = repository.save(incident);
        // UC-49 POST-1: notify Training Manager + send urgent email
        try {
            notificationService.notifyTrainingManagerOfIncident(saved);
            mailService.sendIncidentReported(saved);
        } catch (Exception ex) {
            log.warn("[UC-49] Incident notification failed: {}", ex.getMessage());
        }
        return saved;
    }

    @Override
    public Incident resolveIncident(UUID incidentId, IncidentResolveRequest request) {
        Incident incident =
                repository.findById(incidentId).orElseThrow(() -> new IllegalArgumentException("Incident not found"));

        if ("RESOLVED".equals(incident.getStatus())) {
            throw new IllegalArgumentException("Incident is already resolved");
        }

        if (request.getResolutionNote() == null
                || request.getResolutionNote().trim().isEmpty()) {
            throw new IllegalArgumentException("Resolution note is mandatory when closing an incident (BR-50)");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User resolvedBy =
                userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));

        incident.setStatus("RESOLVED");
        incident.setResolutionNote(request.getResolutionNote());
        incident.setResolvedBy(resolvedBy);
        incident.setResolvedAt(LocalDateTime.now());

        return repository.save(incident);
    }
}
