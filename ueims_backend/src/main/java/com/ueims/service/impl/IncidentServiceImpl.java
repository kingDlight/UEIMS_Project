package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.Incident;
import com.ueims.repository.IncidentRepository;
import com.ueims.service.IncidentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {
    private final IncidentRepository repository;

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
    public Incident reportIncident(com.ueims.dto.request.IncidentReportRequest request) {
        com.ueims.model.entity.EnterpriseAssignment assignment = new com.ueims.model.entity.EnterpriseAssignment();
        assignment.setAssignmentId(request.getAssignmentId());

        com.ueims.model.entity.User reportedBy = new com.ueims.model.entity.User();
        reportedBy.setUserId(request.getReportedById());

        Incident incident = Incident.builder()
                .assignment(assignment)
                .reportedBy(reportedBy)
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

        com.ueims.model.entity.User resolvedBy = new com.ueims.model.entity.User();
        resolvedBy.setUserId(request.getResolvedById());

        incident.setStatus("RESOLVED");
        incident.setResolutionNote(request.getResolutionNote());
        incident.setResolvedBy(resolvedBy);
        incident.setResolvedAt(java.time.LocalDateTime.now());

        return repository.save(incident);
    }
}
