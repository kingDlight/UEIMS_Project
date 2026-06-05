package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.Incident;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.IncidentRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.IncidentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {
    private final IncidentRepository repository;
    private final EnterpriseAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    @Override
    public List<Incident> findAll() {
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
    public Incident createIncident(com.ueims.dto.request.IncidentRequest request) {
        EnterpriseAssignment assignment = assignmentRepository
                .findById(request.getAssignmentId())
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

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
            incident.setResolvedAt(java.time.LocalDateTime.now());
        }

        return repository.save(incident);
    }

    @Override
    public Incident updateIncident(UUID id, com.ueims.dto.request.IncidentRequest request) {
        Incident incident =
                repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Incident not found"));

        EnterpriseAssignment assignment = assignmentRepository
                .findById(request.getAssignmentId())
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

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
            incident.setResolvedAt(java.time.LocalDateTime.now());
        } else if (resolvedBy == null) {
            incident.setResolvedAt(null);
        }
        incident.setResolvedBy(resolvedBy);

        return repository.save(incident);
    }

    @Override
    public Incident reportIncident(com.ueims.dto.request.IncidentReportRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser =
                userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));

        EnterpriseAssignment assignment = assignmentRepository
                .findById(request.getAssignmentId())
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        boolean isStudent = assignment.getStudent().getUserId().equals(currentUser.getUserId());
        boolean isEnterprise = assignment.getEnterprise() != null
                && currentUser.getEnterprise() != null
                && assignment
                        .getEnterprise()
                        .getEnterpriseId()
                        .equals(currentUser.getEnterprise().getEnterpriseId());

        if (!isStudent && !isEnterprise) {
            throw new IllegalArgumentException("You do not have permission to report an incident for this assignment");
        }

        Incident incident = Incident.builder()
                .assignment(assignment)
                .reportedBy(currentUser)
                .category(request.getCategory())
                .description(request.getDescription())
                .evidenceUrls(request.getEvidenceUrls())
                .status("OPEN")
                .build();

        return repository.save(incident);
    }

    @Override
    public Incident resolveIncident(UUID incidentId, com.ueims.dto.request.IncidentResolveRequest request) {
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
        incident.setResolvedAt(java.time.LocalDateTime.now());

        return repository.save(incident);
    }
}
